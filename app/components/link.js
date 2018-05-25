const {a} = require('../lib/html');

module.exports = ({...props}, ...children) => (state, actions) => a(
  {
    ...props,
    onclick(e) {
      if (e.which !== 1 || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const href = e.currentTarget.getAttribute('href');

      if (! /:\/\//.test(href)) {
        e.preventDefault();
        actions.navigate(href);
      }
    },
  },
  ...children
);
