const {
  mainPage,
  notFoundPage,
} = require('./pages');

const app = (state, actions) => {
  const {page} = state;

  switch (page) {
    case 'mainPage':
      return mainPage(state, actions);
    case 'notFoundPage':
      return notFoundPage(state, actions);
    default:
      return '';
  }
};

module.exports = app;
