const qs = require('qs');

const imm = require('./lib/imm');
const {pack} = require('./lib/packet');

function parseUrl(url) {
  const i = url.indexOf('?');
  let pathname;
  let query;

  if (i > -1) {
    pathname = url.slice(0, i);
    query = qs.parse(url.slice(i + 1));
  }
  else {
    pathname = url;
    query = {};
  }

  return {pathname, query};
}

module.exports = ({history, resolve, ethProvider, api} = {}) => ({
  getState: () => (state) => state,

  init: () => (state) => {
    let address;

    if (ethProvider) {
      address = ethProvider.eth.accounts[0];
    }

    return imm.merge(state, {
      currentAddress: address,
    });
  },

  setTitle: (value) => (state) => {
    if (state.isClient) {
      document.title = value;
    }

    return imm.set(state, 'title', value);
  },

  setCurrentAddress: (address) => (state) => {
    return imm.set(state, 'currentAddress', address);
  },

  navigate: (url) => (state) => {
    if (state.isClient) {
      if (/:\/\//.test(url)) {
        window.location = url;
      }
      // TODO Get whole path.
      else if (history.location.pathname + history.location.search !== url) {
        history.push(url);
        // TODO Scroll to top or to anchor.
        window.scrollTo(0, 0);
      }
    }

    return state;
  },

  set: (params = {}) => (state) => imm.merge(state, params),

  gotoUrl: (url) => (state, actions) => {
    const {pathname, query} = parseUrl(url);
    const {page, title, params = {}} = resolve(pathname);

    if (state.isClient) {
      document.title = title;
    }

    let fullParams = {...query, ...params};

    actions.set({page, params: fullParams, title});

    actions.openPage({page, params: fullParams})
    .catch((error) => {
      actions.setData({error});
    });
  },

  openPage: ({page, params}) => async (state, actions) => {
    try {
      switch (page) {
      case 'mainPage': {
        actions.setData({isLoaded: false});
        const data = await api.getMainPage();
        actions.setData({
          data: Object.assign({}, state.mainPage, data),
        });
        break;
      }
      case 'accountPage': {
        actions.setData({isLoaded: false});
        const data = await api.getAccountMessages(params.address, params.page);
        actions.setData({
          data: Object.assign({}, state.accountPage, data),
        });
        break;
      }
      case 'messagePage': {
        actions.setData({isLoaded: false});
        const data = await api.getAccountMessage(params.address, params.nonce);
        actions.setData({
          data: Object.assign({}, state.messagePage, data),
        });
        break;
      }
      }
    }
    catch (error) {
      console.error(error);
      actions.setData({error});
    }
  },

  setData: ({isLoaded = true, data = {}, error = null} = {}) => (state) => {
    return imm.merge(state, {
      isLoaded,
      data,
      error,
    });
  },

  toggleMessageForm: () => (state) => {
    return imm.setIn(state, ['data', 'isCollapsed'], ! state.data.isCollapsed);
  },

  setMessageText: (text) => (state) => {
    return imm.setIn(state, ['data', 'message'], text);
  },

  sendMessage: ({address, message}) => (state, actions) => {
    if (! message.length) {
      return;
    }

    const {page, params} = state;

    api.getNextParams(address)
    .then(({nonce, lastHash}) => {
      const packet = pack({
        address,
        action: 'publish',
        nonce: nonce + 1,
        prev: lastHash,
      }, message);

      const currentAddress = ethProvider.eth.accounts[0];

      return new Promise((resolve, reject) => {
        ethProvider.personal.sign(
          ethProvider.toHex(packet), currentAddress, toCallback(resolve, reject)
        );
      })
      .then((signature) => api.publishPacket(packet, signature))
      .then(({message: result}) => {
        const state = actions.getState();

        if (state.page === page && state.params === params) {
          actions.setData({
            data: {
              ...state.data,
              message: '',
              items: [result, ...state.data.items],
              count: state.data.count + 1,
            },
          });
        }
      });
    })
    .catch((error) => {
      const state = actions.getState();

      if (state.page === page && state.params === params) {
        actions.setData({
          error,
          data: state.data,
        });
      }
    });
  },
});

function toCallback(resolve, reject) {
  return function(error, ...result) {
    if (error) {
      reject(error);
    }
    else {
      resolve(result);
    }
  };
}
