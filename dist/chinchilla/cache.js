"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const config_1 = require("./config");
const tools_1 = require("./tools");
class BaseCache {
    put(extkey, val, expires = 60) {
        const payload = {
            expires: this.minutesFromNow(expires),
            value: val
        };
        this.setValue(extkey, payload);
    }
    set(key, val, expires = 60) {
        const config = config_1.Config.getInstance();
        this.put(config.getCacheKey(key), val, expires);
    }
    fetch(extkey) {
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
    get(key) {
        const config = config_1.Config.getInstance();
        return this.fetch(config.getCacheKey(key));
    }
    drop(extkey) {
        this.removeValue(extkey);
    }
    remove(key) {
        const config = config_1.Config.getInstance();
        this.drop(config.getCacheKey(key));
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
        const keyparts = extkey.split('*');
        if (keyparts.length > 1) {
            const toDelete = [];
            lodash_1.each(this.storage, (val, key) => {
                if (lodash_1.startsWith(key, keyparts[0]))
                    toDelete.push(key);
            });
            lodash_1.each(toDelete, (key) => delete this.storage[key]);
        }
        else {
            delete this.storage[extkey];
        }
    }
    clear() {
        this.storage = {};
    }
}
exports.RuntimeCache = RuntimeCache;
class StorageCache extends BaseCache {
    constructor() {
        super();
        this.storage = window.localStorage;
    }
    setValue(extkey, val) {
        this.storage.setItem(extkey, JSON.stringify(val));
    }
    getValue(extkey) {
        return JSON.parse(this.storage.getItem(extkey) || null);
    }
    removeValue(extkey) {
        const keyparts = extkey.split('*');
        if (keyparts.length > 1) {
            const toDelete = [];
            for (var i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (lodash_1.startsWith(key, keyparts[0]))
                    toDelete.push(key);
            }
            lodash_1.each(toDelete, (key) => this.storage.removeItem(key));
        }
        else {
            this.storage.removeItem(extkey);
        }
    }
    clear() {
        this.storage.clear();
    }
}
exports.StorageCache = StorageCache;
class Cache {
    static clear() {
        if (!tools_1.Tools.isNode)
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
