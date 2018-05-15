const {h} = require('hyperapp');

module.exports = ({head, body, contentValues}) => h('html', {},
  h('head', {},
    h('title', {}, head.title),
    h('link', {
      href: '/assets/app.css',
      rel: 'stylesheet',
    }),
    h('link', {
      href: '/assets/logo.png',
      rel: 'shortcut icon',
      type: 'image/png',
    }),
  ),
  h('body', {}, [
    h('div', {id: 'app'}, body),
    h('script', {
      id: 'state',
      type: 'application/json',
    }, JSON.stringify(contentValues)),
    h('script', {
      src: '/assets/app.js',
    }),
  ]),
);
