"use strict";
const Kekse = require("cookies-js");
const context_1 = require("./context");
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
    // timestamp to be appended to every request
    // will be the same for a session lifetime
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
        context_1.Context.clearCache();
    }
    static getValue(name) {
        return Config[name] || Cookies.get(Config.cookieKey(name));
    }
    static setValue(name, value) {
        Config[name] = value;
        Cookies.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: 300 });
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
exports.Config = Config;
