function joinLiterals(strings, values) {
  const strLen = strings.length;
  const valLen = values.length;

  const result = new Array(valLen + strLen);
  for (let i = 0; i < valLen; i++) {
    const n = i * 2;
    result[n] = strings[i];
    result[n+1] = String(values[i]);
  }

  if (strLen > valLen) {
    result[strLen + valLen - 1] = strings[strLen - 1];
  }

  return result.join('');
}

function removeIndent(string, newSeparator = '\n') {
  const lines = string.split(/\r?\n/).slice(1, -1);

  let indentLen = 0;
  let indentMatched = false;
  const linesLen = lines.length;
  const result = new Array(linesLen);
  let newLine;

  for (let i = 0; i < linesLen; i++) {
    const line = lines[i];
    const match = line.match(/^\s*/);

    if (! indentMatched) {
      if (line.length === match[0].length) {
        throw new Error(`Line ${i} is empty`);
      }
      else {
        indentLen = match[0].length;
        indentMatched = true;
        newLine = line.slice(indentLen);
      }
    }
    else {
      newLine = line.slice(Math.min(indentLen, match[0].length));
    }

    result[i] = newLine;
  }

  return result.join(newSeparator);
}

function blockToString(strings, ...values) {
  const string = joinLiterals(strings, values);

  return removeIndent(string);
}

module.exports = blockToString;
