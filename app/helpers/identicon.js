const blockies = require('../lib/blockies');
const {img, div} = require('../lib/html');

const identicon = ({address, size = 24, ...props}) => {
  const seed = address.toLowerCase();
  const s = Math.sqrt(size);

  if (typeof document !== 'undefined') {
    return img({
      class: 'rounded',
      ...props,
      src: blockies.create({
        size: 8,
        scale: Math.floor(size / 8),
        seed: seed,
      })
      .toDataURL(),
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
