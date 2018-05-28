const blockies = require('../lib/blockies');
const {img, div} = require('../lib/html');
const memoize = require('fast-memoize');

const toBlockie = memoize(
  (...args) => blockies.create(...args).toDataURL()
);

const identicon = ({address, size = 24, ...props}) => {
  const seed = address.toLowerCase();

  if (typeof document !== 'undefined') {
    return img({
      class: 'rounded',
      ...props,
      src: toBlockie({
        size: 8,
        scale: Math.floor(size / 8),
        seed: seed,
      }),
      width: size,
      height: size,
    });
  }
  else {
    return '';
    return div({
      class: 'rounded',
      style: {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'black',
        display: 'inline-block',
      },
    }, '&nbsp;');
  }
};

exports.identicon = identicon;
