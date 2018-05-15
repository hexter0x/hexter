function doIn(target, path, fn) {
    if (! path.length) {
        return target;
    }
    else if (path.length > 1) {
        const prop = path[0];

        let result;
        if (prop in target === false) {
            result = doIn({}, path.slice(1), fn);
        }
        else {
            result = doIn(target[prop], path.slice(1), fn);
        }

        if (target[prop] !== result) {
            return assign(target, {
                [prop]: result,
            });
        }
        else {
            return target;
        }
    }
    else {
        const prop = path[0];
        if (prop in target === false) {
            return assign(target, {
                [prop]: fn(),
            });
        }
        else {
            const newValue = fn(target[prop]);
            if (! deepEqual(newValue, target[prop])) {
                return assign(target, {
                    [prop]: newValue,
                });
            }
            else {
                return target;
            }
        }
    }
}

function map(target, fn) {
    if (! target.length) {
        return target;
    }

    const l = target.length;
    const result = new Array(l);
    let isChanged = false;

    for (let i = 0; i < l; i++) {
        const item = target[i];
        const newItem = fn(item, i, target);

        if (!deepEqual(item, newItem)) {
            isChanged = true;
        }

        result[i] = freezed(newItem);
    }

    return isChanged
        ? Object.freeze(result)
        : target;
}

function mapIn(target, path, fn) {
    return doIn(target, path, (value = []) => {
        return map(value, fn);
    });
}

function addLast(array, value) {
    return Object.freeze([
        ...array,
        freezed(value),
    ]);
}

function addLastIn(target, path, item) {
    return doIn(target, path, (value = []) => {
        return addLast(value, item);
    });
}

function addFirst(array, value) {
    return Object.freeze([
        freezed(value),
        ...array,
    ]);
}

function addFirstIn(target, path, item) {
    return doIn(target, path, (value = []) => {
        return addFirst(value, item);
    });
}

function removeAt(array, n) {
    return Object.freeze([
        ...array.slice(0, n),
        ...array.slice(n + 1),
    ]);
}

function removeAtIn(target, path, n) {
    return doIn(target, path, (value = []) => {
        return removeAt(value, n);
    });
}

function removeFirst(array) {
    return Object.freeze(array.slice(1));
}

function removeFirstIn(target, path, n) {
    return doIn(target, path, (value = []) => {
        return removeFirst(value, n);
    });
}

function removeLast(array) {
    return Object.freeze(array.slice(0, -1));
}

function removeLastIn(target, path, n) {
    return doIn(target, path, (value = []) => {
        return removeLast(value, n);
    });
}

function filter(target, fn) {
    if (! target.length) {
        return target;
    }

    const l = target.length;
    const result = [];
    let isChanged = false;

    for (let i = 0, n = 0; i < l; i++) {
        const item = target[i];
        const isSelected = fn(item, i, target) === true;

        if (isSelected) {
            result[n] = item;
            n += 1;
        }
        else {
            isChanged = true;
        }
    }

    return isChanged
        ? Object.freeze(result)
        : target;
}

function filterIn(target, path, fn) {
    return doIn(target, path, (value = []) => {
        return filter(value, fn);
    });
}

function get(target, prop, alt) {
    if (typeof target[prop] !== 'undefined') {
        return target[prop];
    }
    else {
        return alt;
    }
}

function getIn(target, path, alt) {
    if (! path.length) {
        return target;
    }
    else if (path.length > 1) {
        const prop = path[0];

        if (prop in target === false) {
            return null;
        }
        else {
            return getIn(target[prop], path.slice(1), alt);
        }
    }
    else {
        return get(target, path[0], alt);
    }
}

function set(target, prop, value) {
    if (prop in target === false || ! deepEqual(target[prop], value)) {
        return assign(target, {
            [prop]: freezed(value),
        });
    }
    else {
        return target;
    }
}

function setIn(target, path, val) {
    if (path.length < 1) {
        return target;
    }
    else if (path.length < 2) {
        return set(target, path[0], val);
    }

    const [prop, head] = tail(path);
    return doIn(target, head, (value = {}) => {
        return set(value, prop, val);
    });
}

function update(target, prop, fn) {
    const value = target[prop];
    const newValue = fn(value);
    if (! deepEqual(value, newValue)) {
        return assign(target, {
            [prop]: freezed(newValue),
        });
    }
    else {
        return target;
    }
}

function updateIn(target, path, fn) {
    if (path.length < 1) {
        return target;
    }
    else if (path.length < 2) {
        return update(target, path, fn);
    }

    const [prop, head] = tail(path);
    return doIn(target, head, (value = {}) => {
        return update(value, prop, fn);
    });
}

function remove(target, prop) {
    if (target.hasOwnProperty(prop)) {
        const newValue = copy(target);
        delete newValue[prop];
        return Object.freeze(newValue);
    }
    else {
        return target;
    }
}

function removeIn(target, path) {
    if (path.length < 1) {
        return target;
    }
    else if (path.length < 2) {
        return remove(target, path);
    }

    const [prop, head] = tail(path);
    return doIn(target, head, (value = {}) => {
        return remove(value, prop);
    });
}

function item(arr, i, value) {
    if (arr.length > i && deepEqual(arr[i], value)) {
        return arr;
    }

    const newValue = [...arr];
    newValue[i] = freezed(value);
    return Object.freeze(newValue);
}

function itemIn(target, path, value) {
    if (path.length < 1) {
        return target;
    }
    else if (path.length < 2) {
        return item(target, path, value);
    }

    const [prop, head] = tail(path);
    return doIn(target, head, (value = {}) => {
        return item(value, prop, value);
    });
}

function merge(target, source) {
    const result = copy(target);
    let isChanged = false;

    for (const [prop, value] of Object.entries(source)) {
        if (! target.hasOwnProperty(prop)) {
            isChanged = true;
            result[prop] = isObject(value) ? freezed(value) : value;
        }
        else if (isNativeObject(value)) {
            if (isNativeObject(target[prop])) {
                result[prop] = merge(target[prop], value);
                if (result[prop] !== target[prop]) {
                    isChanged = true;
                }
            }
            else {
                result[prop] = freezed(value);
                isChanged = true;
            }
        }
        else {
            if (! deepEqual(target[prop], value)) {
                result[prop] = isObject(value) ? freezed(value) : value;
                isChanged = true;
            }
        }
    }

    return isChanged
        ? Object.freeze(result)
        : target;
}

function mergeIn(target, path, value) {
    if (path.length < 1) {
        return target;
    }
    else if (path.length < 2) {
        if (isObject(target[path])) {
            return set(target, path, merge(target[path], value));
        }
        else {
            return set(target, path, value);
        }
    }

    const [prop, head] = tail(path);
    return doIn(target, head, (value = {}) => {
        if (prop in target === false) {
            return assign(target, {
                [prop]: freezed(value),
            });
        }
        else {
            const newValue = merge(target[prop], value);
            return set(target, prop, newValue);
        }
    });
}

const OBJ_CONSTRUCTOR = Object.toString();

function freezed(target) {
    if (! target || typeof target !== 'object') {
        return target;
    }
    else if (Array.isArray(target)) {
        return Object.freeze(target.map(freezed));
    }
    else if (isNativeObject(target)) {
        const duplicate = Object.getOwnPropertyNames(target)
        .reduce(function (result, name){
            result[name] = freezed(target[name]);
            return result;
        }, {});

        return Object.freeze(duplicate);
    }
    else if (typeof target.clone === 'function') {
        return Object.freeze(target.clone());
    }
    else {
        return target;
    }
}

function freeze(target) {
    if (! target || typeof target !== 'object') {
        return target;
    }
    else if (Array.isArray(target)) {
        target.forEach(freeze);
        return Object.freeze(target);
    }
    else {
        Object.getOwnPropertyNames(target)
        .forEach((prop) => freeze(target[prop]));
        return Object.freeze(target);
    }
}

function copy(target) {
    if (! target || typeof target !== 'object') {
        return target;
    }
    else if (Array.isArray(target)) {
        return target.map(copy);
    }
    else if (isNativeObject(target)) {
        const duplicate = Object.getOwnPropertyNames(target)
        .reduce(function (result, name){
            result[name] = copy(target[name]);
            return result;
        }, {});

        return duplicate;
    }
    else if (typeof target.clone === 'function') {
        return target.clone();
    }
    else {
        return target;
    }
}

function assign(target, props) {
    return Object.freeze(
        Object.assign(copy(target), props)
    );
}

// TODO Complete
function deepEqual(target, source) {
    return target === source;
}

function isObject(value) {
    return value !== null && typeof value === 'object';
}

function isNativeObject(value) {
    return isObject(value) && value.constructor.toString() === OBJ_CONSTRUCTOR;
}

function tail(array) {
    return [array[array.length - 1], array.slice(0, -1)];
}

exports.map = map;
exports.mapIn = mapIn;
exports.addLast = addLast;
exports.addLastIn = addLastIn;
exports.addFirst = addFirst;
exports.addFirstIn = addFirstIn;
exports.removeFirst = removeFirst;
exports.removeFirstIn = removeFirstIn;
exports.removeLast = removeLast;
exports.removeLastIn = removeLastIn;
exports.removeAt = removeAt;
exports.removeAtIn = removeAtIn;
exports.item = item;
exports.itemIn = itemIn;
exports.filter = filter;
exports.filterIn = filterIn;
exports.set = set;
exports.setIn = setIn;
exports.get = get;
exports.getIn = getIn;
exports.update = update;
exports.updateIn = updateIn;
exports.remove = remove;
exports.removeIn = removeIn;
exports.merge = merge;
exports.mergeIn = mergeIn;
exports.freezed = freezed;
exports.freeze = freeze;
exports.assign = assign;
