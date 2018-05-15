const http = require('http');
const path = require('path');
const mime = require('mime');
const memoize = require('fast-memoize');
const Plant = require('@plant/plant');
const {renderToString} = require('@hyperapp/render');

const mount = require('./lib/plant/mount.js');
const layout = require('./app/layout');
const {actions, store, view} = require('./app');
const {resolve} = require('./app/router');

const render = (url) => {
  const {title, page} = resolve(url);
  const content = {
    ...store,
    isClient: false,
    url,
    page,
  };

  return renderToString(layout({
    head: {
      title,
    },
    body: view(content, actions()),
    contentValues: content,
  }));
};

const PORT = process.argv[2] || 8080;

const plant = new Plant();

plant.use(mount('/assets', './dist'));

plant.use(({req, res}) => {
  res.html(render(req.url.pathname));
});

const server = http.createServer(plant.handler());

server.listen(PORT, () => {
  console.log('Server is started at localhost:%s', PORT);
});
