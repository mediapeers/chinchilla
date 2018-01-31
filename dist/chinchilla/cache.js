"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const localstorage_ponyfill_1 = require("localstorage-ponyfill");
const config_1 = require("./config");
class BaseCache {
    set(key, val, expires = 60) {
        const payload = {
            expires: this.minutesFromNow(expires),
            value: val
        };
        this.setValue(this.extkey(key), payload);
    }
    get(key) {
        const extkey = this.extkey(key);
        const payload = this.getValue(extkey);
        if (payload) {
            if (Date.now() > payload.expires) {
                this.removeValue(extkey);
                return null;
            }
            return payload.value;
        }
        return null;
    }
    extkey(suffix) {
        return `${config_1.Config.getCacheKey()}-${suffix}`;
    }
    minutesFromNow(min) {
        return Date.now() + min * 60000;
    }
}
exports.BaseCache = BaseCache;
class RuntimeCache extends BaseCache {
    constructor() {
        super();
        this.storage = {};
    }
    setValue(extkey, val) {
        this.storage[extkey] = val;
    }
    getValue(extkey) {
        return this.storage[extkey];
    }
    removeValue(extkey) {
        delete this.storage[extkey];
    }
    clear() {
        this.storage = {};
    }
}
exports.RuntimeCache = RuntimeCache;
class StorageCache extends BaseCache {
    constructor() {
        super();
        this.storage = localstorage_ponyfill_1.createLocalStorage();
    }
    setValue(extkey, val) {
        this.storage.setItem(extkey, JSON.stringify(val));
    }
    getValue(extkey) {
        return JSON.parse(this.storage.getItem(extkey) || null);
    }
    removeValue(extkey) {
        this.storage.removeItem(extkey);
    }
    clear() {
        this.storage.clear();
    }
}
exports.StorageCache = StorageCache;
class Cache {
    static clear() {
        Cache.storage.clear();
        Cache.runtime.clear();
    }
    static random(prefix = 'unknown') {
        const hash = Math.random().toString(36).substr(2, 9);
        return `${prefix}-${hash}`;
    }
    static get storage() {
        if (Cache._storage)
            return Cache._storage;
        return Cache._storage = new StorageCache();
    }
    static get runtime() {
        if (Cache._runtime)
            return Cache._runtime;
        return Cache._runtime = new RuntimeCache();
    }
}
exports.Cache = Cache;
