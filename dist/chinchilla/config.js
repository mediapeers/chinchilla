"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Kekse = require("cookies-js");
const lodash_1 = require("lodash");
const tools_1 = require("./tools");
class Cookies {
    static get(...args) {
        return Kekse.get.apply(null, args);
    }
    static set(...args) {
        return Kekse.set.apply(null, args);
    }
    static expire(...args) {
        return Kekse.expire.apply(null, args);
    }
}
exports.Cookies = Cookies;
class NoCookies {
    static get(...args) { }
    static set(...args) { }
    static expire(...args) { }
}
exports.NoCookies = NoCookies;
class Config {
    static setEndpoint(name, url) {
        Config.endpoints[name] = url;
    }
    static setCookieDomain(domain) {
        Config.domain = domain;
    }
    static setErrorInterceptor(fn) {
        Config.errorInterceptor = fn;
    }
    static getValue(name) {
        return Config[name] || Config.cookiesImpl.get(Config.cookieKey(name));
    }
    static updateCacheKey() {
        let affiliationId, roleId, sessionId, cacheKey;
        if ((affiliationId = Config.getValue('affiliationId')) && (roleId = Config.getValue('roleId'))) {
            cacheKey = `${affiliationId}-${roleId}`;
        }
        else if (sessionId = Config.getValue('sessionId')) {
            cacheKey = sessionId;
        }
        else {
            cacheKey = 'anonymous';
        }
        Config.setValue('cacheKey', cacheKey);
    }
    static setValue(name, value) {
        Config[name] = value;
        Config.cookiesImpl.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: Config.cookieTimeout });
        if (name !== 'cacheKey')
            Config.updateCacheKey();
    }
    static clearValue(name) {
        Config[name] = undefined;
        Config.cookiesImpl.expire(Config.cookieKey(name), { domain: Config.domain });
        if (name !== 'cacheKey')
            Config.updateCacheKey();
    }
    static cookieKey(name) {
        return `chinchilla.${name}`;
    }
}
Config.endpoints = {};
Config.cookieTimeout = 30 * 24 * 60 * 60; // 1 month
Config.timestamp = Date.now() / 1000 | 0;
Config.cookiesImpl = tools_1.Tools.isNode ? NoCookies : Cookies;
exports.Config = Config;
lodash_1.each(['affiliationId', 'roleId', 'sessionId', 'cacheKey'], (prop) => {
    const tail = prop.charAt(0).toUpperCase() + prop.slice(1);
    Config[`get${tail}`] = () => {
        return Config.getValue(prop);
    };
    Config[`set${tail}`] = (value) => {
        Config.setValue(prop, value);
    };
    Config[`clear${tail}`] = () => {
        Config.clearValue(prop);
    };
});
