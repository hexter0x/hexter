const {app} = require('hyperapp');
const {createBrowserHistory} = require('history');

const Api = require('./app/api');
const {actions, store, view} = require('./app');
const {resolve} = require('./app/router');

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

const initState = Object.assign({}, store, {
    ...getContent('state'),
    isClient: true,
    url: String(location.pathname),
});

let ethProvider;

if (typeof web3 !== 'undefined') {
  ethProvider = web3;
}

const api = new Api(
  new Api.HttpAdapter('/api/v1')
);

const root = document.getElementById('app');
root.innerHTML = '';
const main = app(initState || {}, actions({history, resolve, ethProvider, api}), view, root);

history.listen((location) => {
    setTimeout(main.gotoUrl, 0, location.pathname + location.search);
});

setInterval(() => {
    if (typeof web3 === 'undefined') {
      return;
    }

    const {currentAddress} = main.getState();

    if (currentAddress !== web3.eth.accounts[0]) {
      main.setCurrentAddress(web3.eth.accounts[0]);
    }
}, 1000);

main.init();

// Debug purposes
window.getState = () => main.getState();
