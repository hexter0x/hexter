const {h} = require('hyperapp');

module.exports = (props = {}) => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    class: 'feather feather-clock',
    ...props,
}, [
    h('circle', {
        cx: '12',
        cy: '12',
        r: '10',
    }, []),
    h('polyline', {
        points: '12 6 12 12 16 14',
    }, []),
]);
