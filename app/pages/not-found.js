const {div, h1, p} = require('../lib/html');
const link = require('../components/link');

module.exports = (state, actions) => {
  actions.setTitle('Not Found');

  return (
    div({class: 'container paddedX2'}, [
      h1({}, 'Page not found'),
      p({}, [
        'Sorry. There is no such page. Try to look at ',
        link({
          href: '/',
        }, 'main page'),
        '.',
      ]),
    ])
  );
};
