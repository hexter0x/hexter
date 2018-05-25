function pack (params, content) {
  const list = [];
  for (const [key, value] of Object.entries(params)) {
    list.push(`${key}: ${String(value)}`);
  }

  return `${list.join('\r\n')}\r\n\r\n${content}`;
};

// Split string into head and tail by separator
function separate(string, sep) {
  const i = string.indexOf(sep);
  if (i < 0) {
    return [string, ''];
  }

  const head = string.slice(0, i);
  const body = string.slice(i + sep.length);

  return [head, body];
}

// Parse NLS Packet
function unpack(packet) {
  const [head, message] = separate(packet, '\r\n\r\n');

  const params = head.split(/\r\n/)
  .map((line) => separate(line, ':'))
  .reduce((result, [name, value]) => ({
    ...result,
    [name.trim()]: value.trim(),
  }), {});

  return {params, message};
}

exports.pack = pack;
exports.unpack = unpack;
