const {
  form,
  div,
  textarea,
  button,
} = require('../lib/html');
const sendIcon = require('./icons/send-icon');

const progressBar = ({value}) => (
  div({
    class: 'progress',
    style: {
      height: '1px',
      'margin': '.5rem 0 -.5rem',
    },
  }, [
    div({
      class: 'progress-bar',
      role: 'progressbar',
      style: {
        width: `${value}%`,
      },
      'aria-valuenow': value,
      'aria-valuemin': 0,
      'aria-valuemin': 100,
    }),
  ])
);

const messageForm = ({key, message, setMessage, sendMessage, limit}) => (
  form({
    class: 'messageForm',
  }, [
    div({
      class: 'form-group',
    }, [
      textarea({
        key,
        class: 'form-control',
        placeholder: 'Type a message...',
        oninput: (e) => {
          setMessage(e.target.value);
        },
        rows: 3,
      }, [message]),
      progressBar({
        value: (message.length / 256 * 100).toFixed(0),
      }),
    ]),
    div({class: 'text-right'}, [
      button({
        class: 'btn btn-primary btn-sm',
        onclick: (e) => {
          e.preventDefault();
          sendMessage();
        },
      }, sendIcon({width: 16, height: 16})),
    ]),
  ])
);

module.exports = messageForm;
