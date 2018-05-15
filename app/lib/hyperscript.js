const {h} = require('hyperapp');

[
    'html',
    'head',
    'body',
    'title',
    'script',
    'link',
    'div',
    'span',
    'ul',
    'li',
    'header',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'a',
    'strong',
    'em',
    'code',
    'pre',
    'table',
    'thead',
    'tbody',
    'th',
    'td',
    'tr',
    'button',
    'input',
    'hr',
]
.forEach((name) => {
    exports[name] = (...args) => h(name, ...args);
});
