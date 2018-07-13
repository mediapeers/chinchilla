"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const lodash_1 = require("lodash");
const subject_1 = require("./chinchilla/subject");
const config_1 = require("./chinchilla/config");
const context_1 = require("./chinchilla/context");
const cache_1 = require("./chinchilla/cache");
const extractor_1 = require("./chinchilla/extractor");
const chch = Object.assign((one, two, three) => {
    // detach from existing Subject first before creating a new one..
    one = subject_1.Subject.detachFromSubject(one);
    return new subject_1.Subject(one, two, three);
}, {
    config: config_1.Config.getInstance(),
    cache: cache_1.Cache,
    extractor: extractor_1.Extractor,
    new: (app, model, attrs = {}, config) => {
        config = config || config_1.Config.getInstance();
        return lodash_1.merge({ '@context': `${config.settings.endpoints[app]}/context/${model}` }, attrs);
    },
    contextUrl: (app, model, config) => {
        config = config || config_1.Config.getInstance();
        return `${config.settings.endpoints[app]}/context/${model}`;
    },
    context: (urlOrApp, model, config) => {
        config = config || config_1.Config.getInstance();
        if (!model) {
            // assume first param is the context url
            return context_1.Context.get(urlOrApp, config).ready;
        }
        else {
            return context_1.Context.get(`${config.settings.endpoints[urlOrApp]}/context/${model}`, config).ready;
        }
    },
    // unfurl('pm, 'product', 'query', params) -> defaults to $c
    // unfurl('pm, 'product', '$c:query', params)
    // unfurl('pm, 'product', '$m:query_descendants', params)
    unfurl: (app, model, actionName, params) => {
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
    }
});
exports.default = chch;
