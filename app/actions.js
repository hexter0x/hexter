const imm = require('./lib/imm');

module.exports = ({history, db} = {}) => ({
  setTitle: (value) => (state) => {
    if (state.isClient) {
      document.title = value;
    }

    return imm.set(state, 'title', value);
  },
  pageGoto: (url) => (state) => {
    if (state.isClient) {
      // TODO Get whole path.
      if (history.location.pathname !== url) {
        history.push(url);
        // TODO Scroll to top or to anchor.
        window.scrollTo(0, 0);
      }
    }


    return imm.set(state, 'url', url);
  },

  getRandom: () => (state, actions) => {
    // db
  },

  setData: ({isLoaded = true, data = {}, error = null} = {}) => (state) => {
    return imm.merge(state, {
      isLoaded,
      data,
      error,
    });
  }
});
