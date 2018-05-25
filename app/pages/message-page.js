const {h} = require('hyperapp');

const {
  h1,
  h5,
  p,
  div,
} = require('../lib/html');

const messageForm = require('../components/message-form');
const pageContainer = require('../containers/page-container');
const messageView = require('../components/message-view');

const messageList = ({items}) => ul({
  // class: 'unstyled',
  style: {
    listStyle: 'none',
    padding: '0',
  },
}, items.map((item) => li(
  {key: item.nonce, style: {marginBottom: '1rem'}}, messageView(item)
)));

module.exports = (state, actions) => {
  const {data = {}} = state;
  const address = state.params.address.toLowerCase();
  const {message} = data;

  return div({class: 'plato'},
    pageContainer(state, div({class: 'container paddedX2 container-compact'}, [
      message ? messageView(message) : 'No message found',
    ]))
  );
};
