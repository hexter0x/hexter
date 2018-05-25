const {header, div} = require('../lib/html');
const link = require('./link');
const {identicon} = require('./identicon');

module.exports = ({name, address} = {}) => (
  header({
    class: 'row'
  }, [
    div({class: 'col-md-6'}, [
      link({href: '/'}, name)
    ]),
    div({class: 'col-md-6 text-md-right'}, [
      address ? link({href: `/${address}`}, identicon({address})) : null,
    ]),
  ])
);
