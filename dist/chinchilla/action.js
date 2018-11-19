"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const UriTemplate = require("uri-templates");
const Promise = require("bluebird");
const result_1 = require("./result");
const extractor_1 = require("./extractor");
const tools_1 = require("./tools");
// cleans the object to be send
// * rejects attributes starting with $
// * rejects validation errors and isPristine attribute
// * rejects js functions
// * rejects empty objects {}
// * rejects empty objects within array [{}]
const cleanup = (object) => {
    if (lodash_1.isEmpty(object))
        return {};
    var cleaned = {};
    lodash_1.each(object, (value, key) => {
        if (/^\$/.test(key) || key === 'errors' || key === 'isPristine' || lodash_1.isFunction(value)) {
            // skip
        }
        else if (lodash_1.isArray(value)) {
            if (lodash_1.isPlainObject(value[0])) {
                var subset = lodash_1.map(value, (x) => {
                    return cleanup(x);
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
            var cleanedValue = cleanup(value);
            if (!lodash_1.isEmpty(cleanedValue))
                cleaned[key] = cleanedValue;
        }
        else {
            cleaned[key] = value;
        }
    });
    return cleaned;
};
class Action {
    constructor(contextAction, params = {}, body, config, options) {
        this.result = new result_1.Result();
        this.contextAction = contextAction;
        this.uriTmpl = new UriTemplate(contextAction.template);
        this.params = extractor_1.Extractor.uriParams(contextAction, params);
        this.options = options || {};
        if (this.options.raw) {
            console.log(`chinchilla: option 'raw' is deprecated. please use 'rawRequest' instead.`);
            this.options.rawRequest = this.options.raw;
        }
        if (this.options.raw_result) {
            console.log(`chinchilla: option 'raw_result' is deprecated. please use 'rawResult' instead.`);
            this.options.rawResult = this.options.raw_result;
        }
        // reformat body to match rails API
        this.body = this.formatBody(body);
        this.ready = new Promise((resolve, reject) => {
            var required = lodash_1.filter(this.contextAction.mappings, 'required');
            for (var index in required) {
                var variable = lodash_1.get(required[index], 'variable');
                if (!this.params[variable]) {
                    const msg = `Required param '${variable}' for '${this.contextAction.template}' missing!`;
                    if (config.settings.devMode) {
                        return reject(new Error(msg));
                    }
                    else {
                        console.log(msg);
                    }
                }
            }
            var uri = this.uriTmpl.fillFromObject(this.params);
            var req;
            switch (contextAction.method) {
                case 'GET':
                    req = tools_1.Tools.req.get(uri);
                    break;
                case 'POST':
                    req = tools_1.Tools.req.post(uri)
                        .send(this.body);
                    break;
                case 'PUT':
                    req = tools_1.Tools.req.put(uri)
                        .send(this.body);
                    break;
                case 'PATCH':
                    req = tools_1.Tools.req.patch(uri)
                        .send(this.body);
                    break;
                case 'DELETE':
                    req = tools_1.Tools.req.del(uri);
                    break;
            }
            // add timestamp
            req = req.query({ t: config.settings.timestamp });
            // add session by default
            if (!this.options.withoutSession && config.getSessionId()) {
                req = req.set('Session-Id', config.getSessionId());
            }
            if (config.getAffiliationId()) {
                req = req.set('Affiliation-Id', config.getAffiliationId());
            }
            if (config.getRoleId()) {
                req = req.set('Role-Id', config.getRoleId());
            }
            if (config.getFlavours()) {
                req = req.set('Mpx-Flavours', config.getFlavours());
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
            // Timeout after 10 seconds if running as backend-for-frontend.
            if (tools_1.Tools.isNode) {
                req = req.timeout(10000);
            }
            req.end((err, res) => {
                if (err) {
                    const [handled, error] = tools_1.Tools.handleError(err, res, config);
                    return handled ? null : reject(error);
                }
                this.result.success(res, config, this.options);
                resolve(this.result);
            });
        });
    }
    formatBody(data) {
        if (lodash_1.isEmpty(data))
            return;
        var formatted = {};
        if (this.options.rawRequest) {
            formatted = cleanup(data);
        }
        else if (lodash_1.isArray(data)) {
            lodash_1.each(data, (obj) => {
                formatted[obj.id] = this.remapAttributes(cleanup(obj));
            });
        }
        else {
            formatted = this.remapAttributes(cleanup(data));
        }
        return formatted;
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
            // append '_attributes' to nested objects (attributes that are an object or are an array of objects)
            else if (lodash_1.isPlainObject(value) || (lodash_1.isArray(value) && lodash_1.isPlainObject(lodash_1.first(value)))) {
                object[`${key}_attributes`] = value;
                delete object[key];
            }
        });
        return object;
    }
}
exports.Action = Action;
