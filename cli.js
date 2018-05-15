const {renderToString} = require('@hyperapp/render');

const layout = require('./app/layout');
const {view, store} = require('./app');

const url = process.argv[2] || '/';

let title = 'HyperApp';

const body = view({
  ...store,
  isClient: false,
  url,
}, {
  setTitle: (value) => (title = value),
});

console.log(
  renderToString(layout({
    head: {
      title,
    },
    body,
  }))
);
