"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const config_1 = require("./config");
const tools_1 = require("./tools");
const PREFIX = 'chch';
class BaseCache {
    put(extkey, val, expires = 60) {
        const payload = {
            expires: this.minutesFromNow(expires),
            value: val
        };
        this.setValue(extkey, payload);
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
    drop(extkey) {
        this.removeValue(extkey);
    }
    change(extkey, fn, defaultValue, expires = 60) {
        let val = this.fetch(extkey) || defaultValue;
        if (fn) {
            val = fn(val);
        }
        this.put(extkey, val, expires);
    }
    set(key, val, expires = 60) {
        this.put(config_1.Config.instance.getCacheKey(key), val, expires);
    }
    get(key) {
        return this.fetch(config_1.Config.instance.getCacheKey(key));
    }
    remove(key) {
        this.drop(config_1.Config.instance.getCacheKey(key));
    }
    update(key, fn, defaultValue, expires = 60) {
        return this.change(config_1.Config.instance.getCacheKey(key), fn, defaultValue, expires);
    }
    minutesFromNow(min) {
        return Date.now() + min * 60000;
    }
}
exports.BaseCache = BaseCache;
class NoCache extends BaseCache {
    setValue(..._args) { }
    removeValue(..._args) { }
    clear(..._args) { }
    getValue(..._args) { }
}
exports.NoCache = NoCache;
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
            lodash_1.each(this.storage, (_val, key) => {
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
        extkey = `${PREFIX}-${extkey}`;
        this.storage.setItem(extkey, JSON.stringify(val));
    }
    getValue(extkey) {
        extkey = `${PREFIX}-${extkey}`;
        return JSON.parse(this.storage.getItem(extkey) || null);
    }
    removeValue(extkey) {
        extkey = `${PREFIX}-${extkey}`;
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
        const toDelete = [];
        for (var i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (lodash_1.startsWith(key, PREFIX))
                toDelete.push(key);
        }
        lodash_1.each(toDelete, (key) => this.storage.removeItem(key));
    }
}
exports.StorageCache = StorageCache;
class Cache {
    constructor() {
        this.runtime = new RuntimeCache();
        this.storage = tools_1.Tools.isNode ? new NoCache() : new StorageCache();
    }
    clear() {
        this.storage.clear();
        this.runtime.clear();
    }
    random(prefix = 'unknown') {
        const hash = Math.random().toString(36).substr(2, 9);
        return `${prefix}-${hash}`;
    }
    static get instance() {
        if (!Cache._instance)
            Cache._instance = new Cache();
        return Cache._instance;
    }
}
exports.Cache = Cache;
