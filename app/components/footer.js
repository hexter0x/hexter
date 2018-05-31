const {footer, div, a} = require('../lib/html');

module.exports = ({name} = {}) => (
  footer({
    class: 'row text-muted',
  }, [
    div({class: 'col-md-6'}, [
      `\u00a9 ${name}, 2018.`,
    ]),
    div({class: 'col-md-6 text-md-right'}, [
      'Crafted by ',
      a({href: 'https://rumk.in'}, 'Rumkin'),
      '. Source on ',
      a({href: 'https://github.com/hexter0x/hexter'}, 'github'),
      '.',
    ]),
  ])
);
