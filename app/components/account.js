const {span} = require('../lib/html');
const {identicon} = require('./identicon');
const link = require('./link');

module.exports = ({address, size, showLink = true} = {}) => span({class: 'account'}, [
  identicon({address, size}),
  ...(showLink ? [
    ' ',
    link({class: 'account-link', href: `/${address}`}, [
      address,
    ]),
  ] : []),
]);
