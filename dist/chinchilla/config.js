"use strict";
const Kekse = require("cookies-js");
const cache_1 = require("./cache");
class Cookies {
    static get(...args) {
        return (typeof window !== undefined) ?
            Kekse.get.apply(null, args) : null;
    }
    static set(...args) {
        return (typeof window !== undefined) ?
            Kekse.set.apply(null, args) : null;
    }
    static expire(...args) {
        return (typeof window !== undefined) ?
            Kekse.expire.apply(null, args) : null;
    }
}
exports.Cookies = Cookies;
class Config {
    // 1 month
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
        cache_1.Cache.clear();
    }
    static getSessionId() {
        return Config.getValue('sessionId');
    }
    static clearSessionId() {
        Config.clearValue('sessionId');
        cache_1.Cache.clear();
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
Config.timestamp = Date.now() / 1000 | 0;
Config.cookieTimeout = 30 * 24 * 60 * 60; // 1 month
exports.Config = Config;
