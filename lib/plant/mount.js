const fs = require('fs');
const path = require('path');
const mime = require('mime');

const {promisify} = require('util');

const fsStat = promisify(fs.stat);
const fsExists = promisify(fs.exists);

function mount(prefix, location) {
    prefix = path.resolve('/', prefix) + '/';

    return async ({req, res}, next) => {
        const url = path.resolve('/', req.url.pathname);
        if (! url.startsWith(prefix)) {
            return next();
        }

        const filepath = path.join(location, url.slice(prefix.length));

        if (! await fsExists(filepath)) {
            return next();
        }

        const stat = await fsStat(filepath);

        if (! stat.isFile()) {
            return;
        }

        res.headers.set('content-type', mime.getType(filepath));
        res.headers.set('content-length', stat.size);
        res.body = fs.createReadStream(filepath);
    };
}

module.exports = mount;
