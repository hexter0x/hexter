function toHtml(string) {
  const lines = string.split(/\r?\n/).map(replaceInline);

  return lines.join('<br/>\n');
}

function escape (value) {
  return value
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quote;')
  .replace(/'/g, '&#39;');
}

function innerLink(url, label) {
  return `<a href="${url}">${escape(label)}</a>`;
}

function outerLink(url, label) {
  return `<a href="${url}" rel="nofollow">${escape(label)}</a>`;
}

const URL_RE = /(^|(?!(\s)))((https?:)?\/\/((?!((\.|\?|\!|\,)(\s|$)))\S)+)/g;
const ADDR_RE = /(^|\s)(0x[A-Za-z0-9]{40}(\/\d+)?)/g;

function replaceInline(line) {
  return line.replace(URL_RE, (url) => outerLink(url, url))
  .replace(
    ADDR_RE, (all, ...args) => args[0] + innerLink(`/${args[1]}`, args[1])
  );
}

module.exports = toHtml;
