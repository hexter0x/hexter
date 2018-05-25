const {span} = require('../lib/html');
const {identicon} = require('./identicon');
const link = require('./link');

module.exports = ({address, size} = {}) => span({class: 'account'}, [
  identicon({address, size}),
  ' ',
  link({class: 'account-link', href: `/${address}`}, [
    address,
  ]),
]);
