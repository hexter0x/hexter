function resolver(map) {
    return (url) => {
        if (map.hasOwnProperty(url)) {
            return map[url];
        }
        else {
            return map['*'];
        }
    };
}

module.exports = resolver;
