const pathToRegexp = require('path-to-regexp');

const {compile} = pathToRegexp;

function createRoute(route, defaults = {}) {
    const toPath = compile(route);
    const keys = [];
    const re = pathToRegexp(route, keys);

    const fn = (params = {}) => {
        return toPath({
            ...defaults,
            ...params,
        });
    };

    return Object.assign(fn, {
        route,
        regexp: re,
        match(url) {
            const match = url.match(re);

            if (match) {
                const params = {};

                keys.forEach((key, i) => {
                    params[key.name] = match[i + 1];
                });

                return params;
            }
            else {
                return null;
            }
        },
        toString() {
            return route;
        },
    });
};

class Router {
    constructor() {
        this.routes = [];
        this._otherwise ;
    }

    use(route, handler) {
        this.routes.push({route, handler});
        return this;
    }

    match(url) {
        const routes = [...this.routes, this._otherwise];

        for (const {route, handler} of routes) {
            const params = route.match(url);
            if (params) {
                return {params, handler};
            }
        }
    }

    otherwise(handler) {
        this._otherwise = {
            route: createRoute('/(.*)'),
            handler,
        };
        return this;
    }
}

exports.createRoute = createRoute;
exports.Router = Router;
