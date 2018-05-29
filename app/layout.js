const {h} = require('hyperapp');
const {html, meta, head, body, title, link, script} = require('./lib/html');

module.exports = (page) => html({},
  head({},
    title({}, page.head.title),
    meta({name: 'viewport', content: 'initial-scale = 1.0,maximum-scale = 1.0'}),
    link({
      href: '/assets/logo.png',
      rel: 'shortcut icon',
      type: 'image/png',
    }),
    link({
      href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css',
      integrity: 'sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB',
      crossorigin: 'anonymous',
      rel:' stylesheet',
    }),
    link({
      href: '/assets/app.css',
      rel: 'stylesheet',
    }),
  ),
  body({}, [
    h('div', {id: 'app'}, page.body),
    script({
      id: 'state',
      type: 'application/json',
    }, JSON.stringify(page.contentValues)),
    script({
      src: '/assets/app.js',
    }),
  ]),
);
