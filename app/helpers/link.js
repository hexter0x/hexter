function linkGoto(fn, e) {
  if (e.which !== 1 || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }

  e.preventDefault();

  fn(e);
}

exports.goto = (fn) => linkGoto.bind(null, fn);
