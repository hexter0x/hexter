const dayjs = require('dayjs');

const {div, span, small, p, a} = require('../lib/html');
const link = require('./link');
const account = require('./account');
const clockIcon = require('./icons/clock-icon');
const fileIcon = require('./icons/file-icon');

const htmlMessage = (props) => (state, actions) => p({
  onclick(e) {
    if (e.target.nodeName !== 'A') {
      return;
    }

    e.preventDefault();
    actions.navigate(e.target.getAttribute('href'));
  },
  ...props,
});

module.exports = ({html, nonce, account: acc, createdAt}) => div({
  class: 'card',
}, [
  div({class: 'card-body'}, [
    htmlMessage({innerHTML: html, style: {'margin-bottom': '0'}}),
    // hr(),
  ]),
  div({class: 'card-footer text-muted'}, [
    div({class: 'row'}, [
      div({class: 'col-md-8'}, [
        account({address: acc.address, size: 16}),
        span({style: {padding: '0 0.5rem'}}, '/'),
        link({
          href: `/${acc.address}/${nonce}`,
        }, nonce),
      ]),
      div({class: 'col-md-4 text-md-right'}, [
        small({class: 'message-details'}, [
          clockIcon({width: 16, height: 16}),
          ' ',
          dayjs(createdAt).format('HH:mm D MMM \'YY'),
          ' ',
          a({
            'aria-label': 'Signed raw action',
            href: `/${acc.address}/actions/${nonce}`,
          }, fileIcon({ width: 16, height: 16})),
        ]),
      ]),
    ])
  ])
]);
