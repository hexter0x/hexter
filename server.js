const http = require('http');
const path = require('path');
const mime = require('mime');
const memoize = require('fast-memoize');
const Plant = require('@plant/plant');
const {renderToString} = require('@hyperapp/render');
const Sql = require('sequelize');
const ethUtil = require('ethereumjs-util');
const qs = require('qs');

const mount = require('./lib/plant/mount');
const bodyLimit = require('./lib/plant/body-limit');
const streamToPromise = require('./lib/stream-to-promise');
const layout = require('./app/layout');
const {actions, store, view} = require('./app');
const {resolve} = require('./app/router');
const toHtml = require('./app/lib/parser');
const {unpack} = require('./app/lib/packet');

// Default Kilobytes size.
const KiB = 1024;
const NULLHASH = `0x${'0'.repeat(64)}`;

const PORT = process.argv[2] || 8080;

const sql = new Sql({
  dialect: 'sqlite',
  storage: './db.sqlite',
});

const Account = sql.define('account', {
  id: {
    type: Sql.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  address: {
    type: Sql.STRING,
    isNull: false,
  },
  nonce: {
    type: Sql.INTEGER.UNSIGNED,
    isNull: false,
    defaultValue: 0,
  },
  lastHash: {
    type: Sql.STRING,
    isNull: false,
    defaultValue: NULLHASH,
  },
});

const Action = sql.define('action', {
  id: {
    type: Sql.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountId: {
    type: Sql.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
  },
  nonce: {
    type: Sql.INTEGER.UNSIGNED,
    isNull: false,
  },
  data: {
    type: Sql.TEXT,
    isNull: false,
  },
  hash: {
    type: Sql.STRING,
    isNull: false,
  },
  signature: {
    type: Sql.STRING,
    isNull: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['accountId', 'nonce'],
    },
  ]
});

Action.belongsTo(Account, {as: 'account'});

const Message = sql.define('message', {
  id: {
    type: Sql.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountId: {
    type: Sql.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
    isNull: false,
  },
  actionId: {
    type: Sql.INTEGER,
    references: {
      model: Action,
      key: 'id',
    },
    isNull: false,
  },
  // Rendered message value
  html: {
    type: Sql.STRING,
    isNull: false,
  },
  nonce: {
    type: Sql.INTEGER.UNSIGNED,
    isNull: false,
  },
  createDate: {
    type: Sql.DATE,
    isNull: false,
  },
});

Message.belongsTo(Account, {as: 'account'});
Message.belongsTo(Action, {as: 'action'});

function render ({title, ...rest}) {
  const content = {
    ...store,
    ...rest,
    isClient: false,
  };

  return renderToString(layout({
    head: {
      title,
    },
    body: view(content, actions()),
    contentValues: content,
  }));
};

const plant = new Plant();
const router = new Plant.Router();

// Get address from ethereum signature
function getAddress(sig, msg) {
  const {v, r, s} = ethUtil.fromRpcSig(sig);

  const pubKey  = ethUtil.ecrecover(ethUtil.hashPersonalMessage(msg), v, r, s);
  const addrBuf = ethUtil.pubToAddress(pubKey);

  return ethUtil.bufferToHex(addrBuf);
}

// Run SQL transaction
async function execTx(fn) {
    const t = await sql.transaction();

    try {
        await fn(t);
    }
    catch (err) {
        t.rollback();
        throw err;
    }

    t.commit();
}

function sendResult({req, res, result = {}}) {
  switch (req.accept(['json'])) {
  case 'json':
      res.json(output(result));
      break;
  default:
      const url = req.url.pathname;
      const {title, page, status, params = {}} = resolve(url);

      for (const [name, value] of Object.entries(qs.parse(req.url.search.slice(1)))) {
        if (! params.hasOwnProperty(name)) {
          params[name] = value;
        }
      }

      const content = {
          isClient: false,
          isLoaded: true,
          title,
          url,
          page,
          data: output(result),
          params,
      };

      const html = render(content);

      res.status(status)
      .html(html);
  }
}

async function handlePage(fn, ctx) {
    const result = await fn(ctx);

    if (result === null) {
        return;
    }

    sendResult({...ctx, result});
}

// Create page renderer handler
function pageHandler(fn) {
  return handlePage.bind(null, fn);
}

// Check if value if object
function isObject(value) {
  return value && typeof value === 'object';
}

function isPlainObject(value) {
  return isObject(value) && value.constructor === Object;
}

// Output data to the client
function output(value) {
  if (! isObject(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(output);
  }

  switch (value.constructor) {
  case Account:
    return outputAccount(value);
  case Action:
    return outputAction(value);
  case Message:
    return outputMessage(value);
  default:
    return Object.entries(value)
    .reduce((result, [key, value]) => ({
      ...result,
      [key]: output(value),
    }), {});
  }
}

// Output Account instance
function outputAccount(value) {
  return {
    $type: 'account',
    address: value.address,
    nonce: value.nonce,
    lastHash: value.lastHash,
  };
}

// Output Action instance
function outputAction(value) {
  return {
    $type: 'action',
    id: value.id,
    nonce: value.id,
    type: value.type,
    data: value.data,
    hash: value.hash,
  };
}

// Output Message instance
function outputMessage(value) {
  return {
    $type: 'message',
    html: value.html,
    nonce: value.nonce,
    createdAt: value.createdAt,
    account: value.account ? outputAccount(value.account) : undefined,
  };
}

async function listMessages({address, page = 1, size = 25}) {
  const query = {};

  if (address) {
    const account = await Account.findOne({
      where: {address: address.toLowerCase()},
    });

    if (! account) {
      return {items: [], count: 0};
    }

    query.accountId = account.id;
  }

  const [items, [count]] = await Promise.all([
    Message.findAll({
      where: query,
      order: [
        ['nonce', 'DESC'],
      ],
      offset: size * (page - 1),
      limit: size,
      include: [
        'account',
      ],
    }),
    Message.findAll({
      where: query,
      attributes: [
        [Sql.fn('COUNT', Sql.col('id')), 'count'],
      ],
    }),
  ]);

  return {
    items,
    count: count.get('count'),
  };
}

async function listAccounts({size = 25, page = 1} = {}) {
  const query = {};

  const [items, [count]] = await Promise.all([
    Account.findAll({
      where: query,
      order: [
        ['createdAt', 'DESC'],
      ],
      offset: size * (page - 1),
      limit: size,
    }),
    Account.findAll({
      where: query,
      attributes: [
        [Sql.fn('COUNT', Sql.col('id')), 'count'],
      ],
    }),
  ]);

  return {
    items,
    count: count.get('count'),
  };
}

async function getMessageWithNonce(address, nonce) {
  const account = await Account.findOne({
    where: {address},
  });

  if (! account || nonce > account.nonce) {
    return null;
  }

  const message = await Message.findOne({
    where: {
      accountId: account.id,
      nonce,
    },
  });

  if (! message) {
    return null;
  }

  message.account = account;

  return message;
}

async function getActionWithNonce(address, nonce) {
  const account = await Account.findOne({
    where: {address},
  });

  if (! account || nonce > account.nonce) {
    return null;
  }

  const action = await Action.findOne({
    where: {
      accountId: account.id,
      nonce,
    },
  });

  if (! action) {
    return null;
  }

  action.account = account;

  return action;
}

router.get('/accounts/new', async ({req, res}) => {
  const accounts = await listAccounts();

  res.json(output({accounts}));
});

router.get('/accounts/:address(0x[a-z0-9]{40})/next', async ({req, res}) => {
  const address = req.params.address.toLowerCase();
  const account = await Account.findOne({
    where: {
      address,
    },
  });

  if (account) {
    res.json({
      nonce: account.nonce,
      lastHash: account.lastHash.toString(),
    });
  }
  else {
    res.json({
      nonce: 0,
      lastHash: NULLHASH,
    });
  }
});

router.get('/accounts/:address(0x[a-z0-9]{40})/messages/:nonce', async ({req, res}) => {
  const address = req.params.address.toLowerCase();
  const nonce = parseInt(req.params.nonce, 10);

  const message = await getMessageWithNonce(address, nonce);

  if (! message) {
    return;
  }

  res.json(
    output({message})
  );
});

router.get('/messages', async ({req, res}) => {
  const address = req.url.searchParams.get('address');
  const page = parseInt(req.url.searchParams.get('page') || '1', 10);

  const {items, count} = await listMessages({address, page});

  res.json(
    output({items, count})
  );
});

router.post('/actions', async ({req, res}) => {
  const sig = req.headers.get('x-signature');
  const data = await streamToPromise(req.stream);

  let signAddress;
  try {
    signAddress = getAddress(sig, data);
  }
  catch (err) {
    res.status(400)
    .json({
      error: {
        code: 'invalid_signature',
      },
    });
    console.error(err);
    return;
  }

  const hash = '0x' + ethUtil.keccak(data).toString('hex');
  const packet = unpack(data.toString());
  const {params} = packet;
  const {address} = params;

  if (address !== signAddress) {
    res.status(400)
    .json({
      error: {code: 'address_incorrect', detail:{address:params.address, signAddress}},
    });
    return;
  }

  if (params.action !== 'publish') {
    res.status(400)
    .json({
      error: {code: 'publish_error'},
    });
    return;
  }

  if (packet.message.length > 256 || packet.message.length === 0) {
    res.status(400)
    .json({
      error: {code: 'msg_length'},
    });
    return;
  }

  const nonce = parseInt(params.nonce, 10);

  if (nonce < 1 || isNaN(nonce)) {
    res.status(400)
    .json({
      error: {code: 'nonce_type'},
    });
    return;
  }

  let account = await Account.findOne({
    where: {
      address,
    },
  });

  let message;

  try {
    await execTx(async (transaction) => {
      if (! account) {
        account = await Account.create({address}, {transaction});
      }

      if (nonce !== account.nonce + 1) {
        throw {code: 'nonce_value', details: {nonce}};
      }
      else if (packet.params.prev!== account.lastHash) {
        throw {code: 'prevHash_value', details: {prevHash: account.lastHash}};
      }

      const action = await Action.create({
        accountId: account.id,
        nonce,
        data,
        hash,
        signature: sig,
      }, {transaction});

      const html = toHtml(packet.message);

      message = await Message.create({
        accountId: account.id,
        actionId: action.id,
        html,
        nonce,
      }, {transaction});

      await account.update({
        nonce,
        lastHash: hash,
      }, {transaction});

      message.account = account;
    });
  }
  catch (error) {
    if (isPlainObject(error)) {
      res.status(400)
      .json({error});
      return;
    }
    else {
      throw error;
    }
  }

  if (message) {
    res.json(
      output({message})
    );
  }
});

plant.use(bodyLimit(1 * KiB));
plant.use('/api/v1', router);
plant.use(mount('/assets', './dist'));
plant.router((router) => {
  router.get('/', pageHandler(async ({req, res}) => {
    const accounts = await listAccounts();

    return {accounts};
  }));

  router.get('/:address(0x[a-z0-9]{40})', pageHandler(async ({req, res}) => {
    const {address} = req.params;
    const page = parseInt(req.url.searchParams.get('page') || '1', 10);

    const {items, count} = await listMessages({
      address,
      page,
    });

    return {items, count};
  }));

  router.get('/:address(0x[a-z0-9]{40})/:nonce(\\d+)', pageHandler(async ({req, res}) => {
    const {address} = req.params;
    const nonce = parseInt(req.params.nonce, 10);

    const message = await getMessageWithNonce(address, nonce);

    if (! message) {
      return null;
    }

    return {message};
  }));

  router.get('/:address(0x[a-z0-9]{40})/actions/:nonce(\\d+)', async ({req, res}) => {
    const {address} = req.params;
    const nonce = parseInt(req.params.nonce, 10);

    const action = await getActionWithNonce(address, nonce);

    if (! action) {
      res.status(404)
      .text('Not found');
      return;
    }

    res.text(`${'---Signature'.padEnd(80, '-')}\n${action.signature.slice(2)}\n${'---Hash'.padEnd(80, '-')}\n${action.hash}\n${'---Message'.padEnd(80, '-')}\n${action.data}`)
  });

  router.use(sendResult);
});

const server = http.createServer(plant.handler());

sql.sync()
.then(() => {
  server.listen(PORT, () => {
    console.log('Server is started at localhost:%s', PORT);
  });
});
