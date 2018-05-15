const resolver = require('./lib/resolver');
const routes = require('./routes');

exports.resolve = resolver(routes);
