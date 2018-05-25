const {
  mainPage,
  accountPage,
  messagePage,
  notFoundPage,
} = require('./pages');

const app = (state, actions) => {
  const {page} = state;

  switch (page) {
    case 'mainPage':
      return mainPage(state, actions);
    case 'accountPage':
      return accountPage(state, actions);
    case 'messagePage':
      return messagePage(state, actions);
    case 'notFoundPage':
      return notFoundPage(state, actions);
    default:
      return '';
  }
};

module.exports = app;
