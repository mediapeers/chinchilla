"use strict";
var lodash_1 = require('lodash');
var request = require('superagent');
var UriTemplate = require('uri-templates');
var Promise = require('bluebird');
var config_1 = require('./config');
var result_1 = require('./result');
var extractor_1 = require('./extractor');
var Action = (function () {
    function Action(contextAction, params, body, options) {
        var _this = this;
        if (params === void 0) { params = {}; }
        this.result = new result_1.Result();
        this.contextAction = contextAction;
        this.uriTmpl = new UriTemplate(contextAction.template);
        this.params = extractor_1.Extractor.uriParams(contextAction, params);
        this.options = options;
        // reformat body to match rails API
        this.body = this.formatBody(body);
        this.ready = new Promise(function (resolve, reject) {
            var uri = _this.uriTmpl.fillFromObject(_this.params);
            var req;
            switch (contextAction.method) {
                case 'GET':
                    req = request.get(uri);
                    break;
                case 'POST':
                    req = request.post(uri)
                        .send(_this.body);
                    break;
                case 'PUT':
                    req = request.put(uri)
                        .send(_this.body);
                    break;
                case 'PATCH':
                    req = request.patch(uri)
                        .send(_this.body);
                    break;
                case 'DELETE':
                    req = request.del(uri);
                    break;
            }
            // add timestamp
            req = req.query({ t: config_1.Config.timestamp });
            // add session by default
            if (!options || !(options.withoutSession === true)) {
                req = req.set('Session-Id', config_1.Config.getSessionId());
            }
            // add custom headers
            if (options && (options.header || options.headers)) {
                var headers = options.headers || options.header;
                if (typeof headers === 'string')
                    req.set(headers, 'true');
                else if (typeof headers === 'object')
                    for (var key in headers)
                        req.set(key, headers[key]);
            }
            req.end(function (err, res) {
                if (err) {
                    var error = new result_1.ErrorResult(err.response ? err.response.text : 'No error details available.').error(res);
                    error.stack = err.stack;
                    if (config_1.Config.errorInterceptor) {
                        // if error interceptor returns true, then abort (don't resolve nor reject)
                        if (config_1.Config.errorInterceptor(error))
                            return;
                    }
                    return reject(error);
                }
                _this.result.success(res);
                resolve(_this.result);
            });
        });
    }
    Action.prototype.formatBody = function (body) {
        var _this = this;
        if (lodash_1.isEmpty(body))
            return;
        var formatted = {};
        if (this.options && (this.options.raw === true)) {
            formatted = this.cleanupObject(body);
        }
        else if (lodash_1.isArray(body)) {
            lodash_1.each(body, function (obj) {
                formatted[obj.id] = _this.remapAttributes(_this.cleanupObject(obj));
            });
        }
        else {
            formatted = this.remapAttributes(this.cleanupObject(body));
        }
        return formatted;
    };
    // cleans the object to be send
    // * rejects attributes starting with $
    // * rejects validation errors and isPristine attribute
    // * rejects js functions
    // * rejects empty objects {}
    // * rejects empty objects within array [{}]
    Action.prototype.cleanupObject = function (object) {
        var _this = this;
        if (lodash_1.isEmpty(object))
            return {};
        var cleaned = {};
        lodash_1.each(object, function (value, key) {
            if (/^\$/.test(key) || key === 'errors' || key === 'isPristine' || lodash_1.isFunction(value)) {
            }
            else if (lodash_1.isArray(value)) {
                if (lodash_1.isPlainObject(value[0])) {
                    var subset = lodash_1.map(value, function (x) {
                        return _this.cleanupObject(x);
                    });
                    cleaned[key] = lodash_1.reject(subset, function (x) {
                        return lodash_1.isEmpty(x);
                    });
                }
                else {
                    cleaned[key] = value;
                }
            }
            else if (lodash_1.isPlainObject(value)) {
                var cleanedValue = _this.cleanupObject(value);
                if (!lodash_1.isEmpty(cleanedValue))
                    cleaned[key] = cleanedValue;
            }
            else {
                cleaned[key] = value;
            }
        });
        return cleaned;
    };
    Action.prototype.remapAttributes = function (object) {
        lodash_1.each(object, function (value, key) {
            // split csv string to array
            if (lodash_1.isString(value) && /_ids$/.test(key)) {
                var values = lodash_1.select(value.split(','), function (item) {
                    return !lodash_1.isEmpty(item);
                });
                object[key] = values;
            }
            else if (lodash_1.isPlainObject(value) || (lodash_1.isArray(value) && lodash_1.isPlainObject(lodash_1.first(value)))) {
                object[(key + "_attributes")] = value;
                delete object[key];
            }
        });
        return object;
    };
    return Action;
}());
exports.Action = Action;
