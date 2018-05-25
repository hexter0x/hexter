const {h} = require('hyperapp');

const {div, a, h3, code} = require('../lib/html');
const link = require('../components/link');
const account = require('../components/account');
const pageContainer = require('../containers/page-container');

const accountsList = ({items, count}) => (
  div({class: 'list-group'}, [
    items.map(
      ({address}) => link({class: 'list-group-item list-group-item-action', href: `/${address}`}, account({address, size: 16})
    )),
  ])
);

module.exports = (state, actions) => {
  const {data = {}} = state;

  const {accounts = {items:[], count: 0}} = data;

  return div({class: 'plato'}, pageContainer(state, div({class: 'container paddedX2 container-compact'}, [
    h3({}, 'Last added accounts'),
    accountsList(accounts),
  ])));
};
