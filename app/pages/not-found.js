const {h} = require('hyperapp');
const {goto} = require('../helpers/link');

module.exports = (state, actions) => {
  actions.setTitle('Not Found');

  return (
    h('div', {class: 'container'}, [
      h('h1', {}, 'Page not found'),
      h('p', {}, [
        'Sorry. There is no such page. Try to look at ',
        h('a', {
          href: '/',
          onclick: goto(() => actions.pageGoto('/')),
        }, 'main page'),
        '.',
      ]),
    ])
  );
};
