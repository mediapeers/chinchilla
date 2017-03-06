"use strict";
const lodash_1 = require("lodash");
const request = require("superagent");
const UriTemplate = require("uri-templates");
const config_1 = require("./config");
const result_1 = require("./result");
const extractor_1 = require("./extractor");
class Action {
    constructor(contextAction, params = {}, body, options) {
        this.result = new result_1.Result();
        this.contextAction = contextAction;
        this.uriTmpl = new UriTemplate(contextAction.template);
        this.params = extractor_1.Extractor.uriParams(contextAction, params);
        this.options = options;
        // reformat body to match rails API
        this.body = this.formatBody(body);
        this.ready = new Promise((resolve, reject) => {
            var uri = this.uriTmpl.fillFromObject(this.params);
            var req;
            switch (contextAction.method) {
                case 'GET':
                    req = request.get(uri);
                    break;
                case 'POST':
                    req = request.post(uri)
                        .send(this.body);
                    break;
                case 'PUT':
                    req = request.put(uri)
                        .send(this.body);
                    break;
                case 'PATCH':
                    req = request.patch(uri)
                        .send(this.body);
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
            // add affiliation if configured
            if (config_1.Config.getAffiliationId()) {
                req = req.set('Affiliation-Id', config_1.Config.getAffiliationId());
            }
            // add custom headers
            if (options && (options.header || options.headers)) {
                let headers = options.headers || options.header;
                if (typeof headers === 'string')
                    req.set(headers, 'true');
                else if (typeof headers === 'object')
                    for (var key in headers)
                        req.set(key, headers[key]);
            }
            req.end((err, res) => {
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
                this.result.success(res);
                resolve(this.result);
            });
        });
    }
    formatBody(body) {
        if (lodash_1.isEmpty(body))
            return;
        var formatted = {};
        if (this.options && (this.options.raw === true)) {
            formatted = this.cleanupObject(body);
        }
        else if (lodash_1.isArray(body)) {
            lodash_1.each(body, (obj) => {
                formatted[obj.id] = this.remapAttributes(this.cleanupObject(obj));
            });
        }
        else {
            formatted = this.remapAttributes(this.cleanupObject(body));
        }
        return formatted;
    }
    // cleans the object to be send
    // * rejects attributes starting with $
    // * rejects validation errors and isPristine attribute
    // * rejects js functions
    // * rejects empty objects {}
    // * rejects empty objects within array [{}]
    cleanupObject(object) {
        if (lodash_1.isEmpty(object))
            return {};
        var cleaned = {};
        lodash_1.each(object, (value, key) => {
            if (/^\$/.test(key) || key === 'errors' || key === 'isPristine' || lodash_1.isFunction(value)) {
            }
            else if (lodash_1.isArray(value)) {
                if (lodash_1.isPlainObject(value[0])) {
                    var subset = lodash_1.map(value, (x) => {
                        return this.cleanupObject(x);
                    });
                    cleaned[key] = lodash_1.reject(subset, (x) => {
                        return lodash_1.isEmpty(x);
                    });
                }
                else {
                    cleaned[key] = value;
                }
            }
            else if (lodash_1.isPlainObject(value)) {
                var cleanedValue = this.cleanupObject(value);
                if (!lodash_1.isEmpty(cleanedValue))
                    cleaned[key] = cleanedValue;
            }
            else {
                cleaned[key] = value;
            }
        });
        return cleaned;
    }
    remapAttributes(object) {
        lodash_1.each(object, (value, key) => {
            // split csv string to array
            if (lodash_1.isString(value) && /_ids$/.test(key)) {
                var values = lodash_1.select(value.split(','), (item) => {
                    return !lodash_1.isEmpty(item);
                });
                object[key] = values;
            }
            else if (lodash_1.isPlainObject(value) || (lodash_1.isArray(value) && lodash_1.isPlainObject(lodash_1.first(value)))) {
                object[`${key}_attributes`] = value;
                delete object[key];
            }
        });
        return object;
    }
}
exports.Action = Action;
