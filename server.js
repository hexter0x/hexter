const http = require('http');
const path = require('path');
const mime = require('mime');
const Plant = require('@plant/plant');
const {renderToString} = require('@hyperapp/render');
const Sql = require('sequelize');
const ethUtil = require('ethereumjs-util');
const qs = require('qs');
const Eth = require('ethjs');
const EthContract = require('ethjs-contract');

const mount = require('./lib/plant/mount');
const bodyLimit = require('./lib/plant/body-limit');
const streamToPromise = require('./lib/stream-to-promise');
const layout = require('./app/layout');
const {actions, store, view} = require('./app');
const {resolve} = require('./app/router');
const toHtml = require('./app/lib/parser');
const {unpack} = require('./app/lib/packet');
const b = require('./lib/string-block');

// Default Kilobytes size.
const KiB = 1024;
const NULLHASH = `0x${'0'.repeat(64)}`;

const PORT = process.argv[2] || 8080;
const ETHNODE = process.env.ETHNODE || 'https://ropsten.infura.io/Z8iEwVFn2E4nTIxzkuDJ';

const eth = new Eth(new Eth.HttpProvider(ETHNODE));
const contract = new EthContract(eth);
const abi = require('./abi');
const Group = contract(abi);

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
  isContract: {
    type: Sql.BOOLEAN,
    isNull: false,
    defaultValue: false,
  },
});

const Action = sql.define('action', {
  id: {
    type: Sql.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerId: {
    type: Sql.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
    isNull: false,
  },
  senderId: {
    type: Sql.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
    isNull: false,
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
      fields: ['ownerId', 'nonce'],
    },
  ],
});

Action.belongsTo(Account, {as: 'owner'});
Action.belongsTo(Account, {as: 'sender'});

const Message = sql.define('message', {
  id: {
    type: Sql.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerId: {
    type: Sql.INTEGER,
    references: {
      model: Account,
      key: 'id',
    },
    isNull: false,
  },
  senderId: {
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

Message.belongsTo(Account, {as: 'owner'});
Message.belongsTo(Account, {as: 'sender'});
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
    owner: value.owner ? outputAccount(value.owner) : undefined,
    sender: value.sender ? outputAccount(value.sender) : undefined,
  };
}

// Output Message instance
function outputMessage(value) {
  return {
    $type: 'message',
    html: value.html,
    nonce: value.nonce,
    createdAt: value.createdAt,
    owner: value.owner ? outputAccount(value.owner) : undefined,
    sender: value.sender ? outputAccount(value.sender) : undefined,
  };
}

async function list(model, {where, ...rest} = {}) {
  const [items, [count]] = await Promise.all([
    model.findAll({
      where, ...rest,
    }),
    model.findAll({
      where,
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

async function listMessages({address, page = 1, size = 25}) {
  const query = {};

  if (address) {
    const account = await Account.findOne({
      where: {address: address.toLowerCase()},
    });

    if (! account) {
      return {items: [], count: 0};
    }

    query.ownerId = account.id;
  }

  return list(Message, {
    where: query,
    order: [
      ['nonce', 'DESC'],
    ],
    offset: size * (page - 1),
    limit: size,
    include: [
      'owner',
      'sender',
    ],
  });
}

function listAccounts({where = {}, size = 25, page = 1} = {}) {
  const query = {...where};

  return list(Account, {
    where: query,
    order: [
      ['createdAt', 'DESC'],
    ],
    offset: size * (page - 1),
    limit: size,
  });
}

async function getMessageWithNonce(address, nonce) {
  const owner = await Account.findOne({
    where: {address},
  });

  if (! owner || nonce > owner.nonce) {
    return null;
  }

  const message = await Message.findOne({
    where: {
      ownerId: owner.id,
      nonce,
    },
    include: [
      'sender',
    ],
  });

  if (! message) {
    return null;
  }

  message.owner = owner;

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
      ownerId: account.id,
      nonce,
    },
  });

  if (! action) {
    return null;
  }

  action.account = account;

  return action;
}

async function getAccountByAddress(address) {
  let account = await Account.findOne({
    where: {address},
  });

  if (! account) {
    isContract = !! (await eth.getCode(address));
    account = await Account.create({address, isContract});
  }

  return account;
}

router.get('/accounts/new', async ({res}) => {
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

/* eslint-disable max-statements */
router.post('/actions', async ({req, res}) => {
  const sig = req.headers.get('x-signature');
  const data = await streamToPromise(req.stream);

  let senderAddress;
  try {
    senderAddress = getAddress(sig, data);
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

  let owner = await getAccountByAddress(address);
  let sender;
  if (address === senderAddress) {
    sender = owner;
  }
  else if (owner.isContract) {
    // Send permission request...
    const rank = await Group.at(address)
    .getRank(senderAddress);

    if (rank < 1 || rank > 4) {
      res.status(403)
      .json({
        error: {code: 'access_declined'},
      });
    }

    sender = await getAccountByAddress(senderAddress);
  }
  else {
    res.status(403)
    .json({
      error: {code: 'access_declined'},
    });
    return;
  }

  let message;

  if (params.action !== 'publish') {
    res.status(400)
    .json({
      error: {code: 'publish_error'},
    });
    return;
  }

  try {
    await execTx(async (transaction) => {
      if (nonce !== owner.nonce + 1) {
        throw {code: 'nonce_value', details: {nonce}};
      }
      else if (packet.params.prev!== owner.lastHash) {
        throw {code: 'prevHash_value', details: {prevHash: owner.lastHash}};
      }

      const action = await Action.create({
        ownerId: owner.id,
        senderId: sender.id,
        nonce,
        data,
        hash,
        signature: sig,
      }, {transaction});

      const html = toHtml(packet.message);

      message = await Message.create({
        ownerId: owner.id,
        senderId: sender.id,
        actionId: action.id,
        html,
        nonce,
      }, {transaction});

      await owner.update({
        nonce,
        lastHash: hash,
      }, {transaction});

      message.owner = owner;
      message.sender = sender;
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
  router.get('/', pageHandler(async () => {
    const accounts = await listAccounts({
      where: {
        nonce: {[Sql.Op.gt]: 0},
      },
    });

    return {accounts};
  }));

  router.get('/:address(0x[a-z0-9]{40})', pageHandler(async ({req}) => {
    const {address} = req.params;
    const page = parseInt(req.url.searchParams.get('page') || '1', 10);

    const {items, count} = await listMessages({
      address,
      page,
    });

    return {...store.accountPage, items, count};
  }));

  router.get('/:address(0x[a-z0-9]{40})/:nonce(\\d+)', pageHandler(async ({req}) => {
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

    res.text(b`
      ${'---Signature'.padEnd(80, '-')}
      ${action.signature.slice(2)}
      ${'---Hash'.padEnd(80, '-')}
      ${action.hash}
      ${'---Message'.padEnd(80, '-')}
      ${action.data}
    `);
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
