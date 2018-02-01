"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Kekse = require("cookies-js");
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
    static setAffiliationId(id) {
        Config.setValue('affiliationId', id);
    }
    static getAffiliationId() {
        return Config.getValue('affiliationId');
    }
    static clearAffiliationId() {
        Config.clearValue('affiliationId');
    }
    static setSessionId(id) {
        Config.setValue('sessionId', id);
    }
    static getSessionId() {
        return Config.getValue('sessionId');
    }
    static clearSessionId() {
        Config.clearValue('sessionId');
    }
    static setCacheKey(key) {
        Config.setValue('cacheKey', key);
    }
    static getCacheKey() {
        return Config.getValue('cacheKey') || 'anonymous';
    }
    static clearCacheKey() {
        Config.clearValue('cacheKey');
    }
    static getValue(name) {
        return Config[name] || Cookies.get(Config.cookieKey(name));
    }
    static setValue(name, value) {
        Config[name] = value;
        Cookies.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: Config.cookieTimeout });
    }
    static clearValue(name) {
        Config[name] = undefined;
        Cookies.expire(Config.cookieKey(name), { domain: Config.domain });
    }
    static cookieKey(name) {
        return `chinchilla.${name}`;
    }
}
Config.endpoints = {};
Config.cookieTimeout = 30 * 24 * 60 * 60; // 1 month
exports.Config = Config;
