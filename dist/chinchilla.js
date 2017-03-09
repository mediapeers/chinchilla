"use strict";
const lodash_1 = require("lodash");
const subject_1 = require("./chinchilla/subject");
const config_1 = require("./chinchilla/config");
const context_1 = require("./chinchilla/context");
const cache_1 = require("./chinchilla/cache");
let chch = (objectsOrApp, model) => {
    // detach from existing Subject first before creating a new one..
    objectsOrApp = subject_1.Subject.detachFromSubject(objectsOrApp);
    return new subject_1.Subject(objectsOrApp, model);
};
chch['config'] = config_1.Config;
chch['cache'] = cache_1.Cache;
chch['new'] = (app, model, attrs = {}) => {
    return lodash_1.merge({ '@context': `${config_1.Config.endpoints[app]}/context/${model}` }, attrs);
};
chch['contextUrl'] = (app, model) => {
    return `${config_1.Config.endpoints[app]}/context/${model}`;
};
chch['context'] = (urlOrApp, model) => {
    if (!model) {
        // assume first param is the context url
        return context_1.Context.get(urlOrApp).ready;
    }
    else {
        return context_1.Context.get(`${config_1.Config.endpoints[urlOrApp]}/context/${model}`).ready;
    }
};
// unfurl('pm, 'product', 'query', params) -> defaults to $c
// unfurl('pm, 'product', '$c:query', params)
// unfurl('pm, 'product', '$m:query_descendants', params)
chch['unfurl'] = (app, model, actionName, params) => {
    return new Promise(function (resolve, reject) {
        var page = 1;
        var result = { objects: [] };
        var subject = new subject_1.Subject(app, model);
        lodash_1.merge(params, { page: page });
        var fetch = function () {
            var action = lodash_1.last(actionName.match(/(\$[c|m]:)?(.*)/));
            var promise;
            if (lodash_1.startsWith(actionName, '$m')) {
                promise = subject.$m(action, params);
            }
            else {
                promise = subject.$c(action, params);
            }
            promise
                .then(function (pageResult) {
                page = page + 1;
                lodash_1.merge(params, { page: page });
                result.objects = result.objects.concat(pageResult.objects);
                if ((page <= 100) && (page <= (pageResult.headers && pageResult.headers['x-total-pages'] || 0))) {
                    fetch();
                }
                else {
                    resolve(result);
                }
                return true;
            }, function () {
                reject(null);
            });
        };
        fetch();
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = chch;
