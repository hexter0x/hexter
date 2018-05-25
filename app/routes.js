module.exports = {
    '/:address(0x[a-z0-9]{40})/:nonce(\\d+)': {
      title: 'Message',
      page: 'messagePage',
      status: 200,
    },
    '/:address(0x[a-z0-9]{40})': {
        title: 'Account',
        page: 'accountPage',
        status: 200,
    },
    '/': {
      title: 'Main',
      page: 'mainPage',
      status: 200,
    },
    '*': {
        title: 'Nothing Found',
        page: 'notFoundPage',
        status: 404,
    },
};
