function dilute(array, separator) {
  const result = new Array(array.length * 2 - 1);

  for (let i = 0; i < array.length; i++) {
    result[i * 2] = array[i];
    if (i < array.length - 1) {
      result[i * 2 + 1] = separator;
    }
  }

  return result;
}

function flatten(array) {
  return array.reduce((result, items) => [...result, ...items], []);
}

exports.dilute = dilute;
exports.flatten = flatten;
