const {
  // h1,
  h5,
  p,
  div,
  big,
  ul,
  li,
  button,
} = require('../lib/html');

const messageForm = require('../components/message-form');
const account = require('../components/account');
const paginator = require('../components/paginator');
const pageContainer = require('../containers/page-container');
const messageView = require('../components/message-view');
const messageIcon = require('../components/icons/message-icon');

const messageList = ({items}) => ul({
  // class: 'unstyled',
  style: {
    listStyle: 'none',
    padding: '0',
  },
}, items.map((item) => li(
  {key: item.nonce, style: {marginBottom: '1rem'}}, messageView(item)
)));

const emptyMessagesList = () => div({class: 'card'}, [
  div({class: 'card-body text-center'}, [
    h5({class: 'card-title'}, 'Empty'),
    p({class: 'card-text text-muted'}, [
      'There is no messages. Go to account page.',
    ]),
  ]),
]);

const emptyAccount = () => div({class: 'card'}, [
  div({class: 'card-body text-center'}, [
    h5({class: 'card-title'}, 'Nothing here'),
    p({class: 'card-text text-muted'}, [
      'There is no messages yet',
    ]),
  ]),
]);

const messagesView = ({items, count}) => {
  if (count > 0) {
    if (items.length) {
      return messageList({items});
    }
    else {
      return emptyMessagesList();
    }
  }
  else {
    return emptyAccount();
  }
};

const pageView = (state, children) => div({class: 'plato'},
  pageContainer(state,
    div({
      class: 'container paddedX2 container-compact',
    }, children)
  )
);

module.exports = (state, actions) => {
  const {isLoaded, error, data = {}, currentAddress} = state;
  const address = state.params.address.toLowerCase();
  const page = parseInt(state.params.page || '1', 10);

  const message = data.message || '';
  const {items = [], count = 0, isCollapsed = true} = data;

  const pager = paginator({page, count});
  const isSelf = (address === currentAddress);
  const isFormVisible = (isSelf || isCollapsed === false);

  if (! isLoaded) {
    return pageView(state, div({class: 'card-body text-center'}, [
      h5({class: 'card-title'}, 'Loading...'),
      p({class: 'card-text text-muted'}, [
        'Please wait',
      ]),
    ]));
  }
  else if (error) {
    return pageView(state, div({class: 'card-body text-center'}, [
      h5({class: 'card-title'}, 'Error'),
      p({class: 'card-text text-muted'}, [
        'Sorry! Error occured.',
      ]),
    ]));
  }

  return pageView(state, [
    p({class: 'text-center padded'}, [
      big({}, account({address, size: 24})),
      ' ',
      (! isSelf) ? button({
        class: 'btn btn-light btn-sm',
        onclick() {
          actions.toggleMessageForm();
        },
      }, [
        messageIcon({width: 16, height: 16}),
      ]) : null,
    ]),
    isFormVisible ? div({class: 'card bg-light', style: {marginBottom: '1rem'}}, [
      div({class: 'card-body'}, [
        messageForm({
          key: count + 1,
          message,
          limit: 256,
          setMessage: (text) => actions.setMessageText(text),
          sendMessage: () => actions.sendMessage({address, message}),
        }),
      ]),
    ]) : null,
    messagesView({items, count}),
    pager ? div({class: 'padded'}, [
      pager,
    ]) : null,
  ]);
};
