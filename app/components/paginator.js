const {ul, li, nav} = require('../lib/html');
const link = require('./link');

module.exports = ({page = 1, size = 25, count = 0} = {}) => {
  const total = Math.ceil(count / size);
  const start = Math.floor((page - 1) / 10) * 10;
  const end = Math.min(total, start + 10);

  if (end < 2) {
    return null;
  }

  const items = [];

  if (page > 0) {
    items.push(li({class: 'page-item'}, [
      link({class: 'page-link', href: `?page=${page - 1}`}, 'Prev')
    ]));
  }
  else {
    items.push(li({class: 'page-item disabled'}, [
      link({class: 'page-link', href: `?page=${page}`, disabled: true}, 'Prev')
    ]));
  }

  for (let i = start; i < end; i++) {
    const p = i + 1;
    if (p === page) {
      items.push(li({class: 'page-item active'}, [
        link({class: 'page-link', href: `?page=${p}`}, p)
      ]));
    }
    else {
      items.push(li({class: 'page-item'}, [
        link({class: 'page-link', href: `?page=${p}`}, p)
      ]));
    }
  }

  if (page < total) {
    items.push(li({class: 'page-item'}, [
      link({class: 'page-link', href: `?page=${page + 1}`}, 'Next')
    ]));
  }
  else {
    items.push(li({class: 'page-item disabled'}, [
      link({class: 'page-link', href: `?page=${page}`, disabled: true}, 'Next')
    ]));
  }

  return nav({'aria-label': 'Pagination'}, [
    ul({class: 'pagination'}, items),
  ]);
}
