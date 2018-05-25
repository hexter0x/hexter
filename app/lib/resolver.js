const pathToRegexp = require('path-to-regexp');

/**
 * Creates url matcher from pattern.
 *
 * @param  {String} route Pattern
 * @return {function(String)} Route matcher function.
 */
function createParamsMatcher(route) {
  const keys = [];
  const re = pathToRegexp(route, keys);

  return function(url) {
    const matches = re.exec(url);

    if (! matches) {
      return null;
    }

    const params = {};

    matches.slice(1)
    .forEach((match, i) => {
      params[keys[i].name] = match;
    });

    return params;
  };
}

function resolver(map) {
    const routes = [];

    for (const [route, values] of Object.entries(map)) {
      routes.push({
        match: createParamsMatcher(route),
        values,
      });
    }

    return (url) => {
        for (const {match, values} of routes) {
          const params = match(url);
          if (params) {
            return {...values, params};
          }
        }
        return map['*'] || null;
    };
}

module.exports = resolver;
