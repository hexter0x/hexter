const {app} = require('hyperapp');
const {createBrowserHistory} = require('history');

const {actions, state, view} = require('./app');

const history = createBrowserHistory();

function htmlDecode(input){
    const el = document.createElement('div');
    el.innerHTML = input;
    // handle case of empty input
    return el.childNodes.length === 0 ? '' : el.childNodes[0].nodeValue;
}

function getContent(id) {
    const script = document.getElementById(id);
    if (script) {
      return JSON.parse(htmlDecode(script.textContent));
    }
    else {
      return null;
    }
}

const initState = Object.assign({}, state, {
    ...getContent('state'),
    isClient: true,
    url: String(location.pathname),
});

console.log(initState);

const root = document.getElementById('app');
const main = app(initState || {}, actions({history}), view, root);

history.listen((location) => {
    main.pageGoto(location.pathname);
});
