"use strict";
var Cookies = require('js-cookie');
var Config = (function () {
    function Config() {
    }
    // timestamp to be appended to every request
    // will be the same for a session lifetime
    Config.setEndpoint = function (name, url) {
        Config.endpoints[name] = url;
    };
    Config.setCookieDomain = function (domain) {
        Config.domain = domain;
    };
    Config.setSessionId = function (id) {
        Cookies.set(Config.sessionKey, id, { path: '/', domain: Config.domain, expires: 300 });
    };
    Config.setErrorInterceptor = function (fn) {
        Config.errorInterceptor = fn;
    };
    Config.getSessionId = function () {
        return Cookies.get(Config.sessionKey);
    };
    Config.clearSessionId = function () {
        Cookies.remove(Config.sessionKey, { domain: Config.domain });
    };
    Config.endpoints = {};
    Config.timestamp = Date.now() / 1000 | 0;
    Config.sessionKey = 'chinchillaSessionId';
    return Config;
}());
exports.Config = Config;
