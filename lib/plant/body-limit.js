function getRequestSize(req) {
  if (req.headers.has('content-length')) {
    return parseInt(req.headers.get('content-length'), 10);
  }
  else {
    return 0;
  }
}

function bodyLimit(maxSize = 0) {
  return function({req, res}, next) {
    const size = getRequestSize(req);

    if (size > maxSize) {
      res.status(413)
      .text(`Request maximum size is ${maxSize}. ${size} bytes sent.`);
      return;
    }

    return next();
  };
}

module.exports = bodyLimit;
