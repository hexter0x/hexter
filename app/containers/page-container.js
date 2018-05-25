const {div} = require('../lib/html');
const footer = require('../components/footer');
const header = require('../components/header');

module.exports = (state, ...children) => (
  [
    div({class: 'border-bottom', style: {flex: 0}}, [
      div({class: 'container container-compact padded'}, [
        header({
          name: state.app.title,
          address: state.currentAddress,
        }),
      ]),
    ]),
    div({style: {flex: 'auto'}}, [
      ...children,
    ]),
    div({class: 'border-top', style: {flex: 0}}, [
      div({class: 'container container-compact padded'}, [
        footer({
          name: state.app.title,
        }),
      ]),
    ])
  ]
);
