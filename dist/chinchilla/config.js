"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Kekse = require("cookies-js");
const qs = require("querystringify");
const lodash_1 = require("lodash");
const tools_1 = require("./tools");
class Cookies {
    static get(...args) {
        if (tools_1.Tools.isNode)
            return;
        return Kekse.get.apply(null, args);
    }
    static set(...args) {
        if (tools_1.Tools.isNode)
            return;
        return Kekse.set.apply(null, args);
    }
    static expire(...args) {
        if (tools_1.Tools.isNode)
            return;
        return Kekse.expire.apply(null, args);
    }
}
exports.Cookies = Cookies;
const configNames = ['affiliationId', 'roleId', 'sessionId', 'flavours'];
const settingNames = ['endpoints', 'cookieTimeout', 'timestamp', 'domain', 'devMode', 'errorInterceptor'];
class Config {
    static getInstance() {
        if (!Config.instance)
            Config.instance = new Config();
        return Config.instance;
    }
    constructor(settings = {}) {
        this.initGetSet();
        this.settings = lodash_1.merge({
            endpoints: {},
            cookieTimeout: 30 * 24 * 60 * 60,
            timestamp: Date.now() / 1000 | 0,
        }, settings);
    }
    initGetSet() {
        lodash_1.each(settingNames, (prop) => {
            Object.defineProperty(this, prop, {
                get: () => {
                    console.log(`chinchilla: 'config.${prop}' is deprecated. please use 'config.settings.${prop}' instead.`);
                    return lodash_1.get(this.settings, prop);
                },
                set: (value) => {
                    console.log(`chinchilla: 'config.${prop}' is deprecated. please use 'config.settings.${prop}' instead.`);
                    return this.settings[prop] = value;
                }
            });
        });
        lodash_1.each(configNames, (prop) => {
            const tail = prop.charAt(0).toUpperCase() + prop.slice(1);
            this[`get${tail}`] = () => {
                return this.getValue(prop);
            };
            this[`set${tail}`] = (value) => {
                this.setValue(prop, value);
            };
            this[`clear${tail}`] = () => {
                this.clearValue(prop);
            };
        });
    }
    clone() {
        return new Config(lodash_1.clone(this.settings));
    }
    setEndpoint(name, url) {
        this.settings.endpoints[name] = url;
    }
    setCookieDomain(domain) {
        this.settings.domain = domain;
    }
    setErrorInterceptor(fn) {
        this.settings.errorInterceptor = fn;
    }
    getValue(name) {
        return this.settings[name] || Cookies.get(this.cookieKey(name));
    }
    updateCacheKey() {
        let affiliationId, roleId, sessionId, cacheKey;
        if ((affiliationId = this.getValue('affiliationId')) && (roleId = this.getValue('roleId'))) {
            cacheKey = `${affiliationId}-${roleId}`;
        }
        else if (sessionId = this.getValue('sessionId')) {
            cacheKey = sessionId;
        }
        else {
            cacheKey = 'anonymous';
        }
        this.setValue('cacheKey', cacheKey);
    }
    getCacheKey(suffix) {
        return suffix ? `${this.getValue('cacheKey')}-${suffix}` : this.getValue('cacheKey');
    }
    setValue(name, value) {
        this.settings[name] = value;
        Cookies.set(this.cookieKey(name), value, {
            path: '/',
            domain: this.settings.domain,
            expires: this.settings.cookieTimeout,
            secure: !this.settings.devMode,
        });
        if (name !== 'cacheKey')
            this.updateCacheKey();
    }
    clearValue(name) {
        this.settings[name] = undefined;
        Cookies.expire(this.cookieKey(name), { domain: this.settings.domain });
        if (name !== 'cacheKey')
            this.updateCacheKey();
    }
    clear() {
        lodash_1.each(configNames, (name) => {
            if (name === 'affiliationId')
                return;
            this.clearValue(name);
        });
    }
    cookieKey(name) {
        return `chinchilla.${name}`;
    }
    setFlavour(name, value) {
        let flavours = this.activeFlavours;
        flavours[name] = value;
        this.setFlavours(qs.stringify(flavours));
        return flavours;
    }
    // returns current flavours key/values
    get activeFlavours() {
        const value = this.getFlavours();
        return value ? qs.parse(value) : {};
    }
}
exports.Config = Config;
