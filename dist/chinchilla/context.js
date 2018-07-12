"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Promise = require("bluebird");
const cache_1 = require("./cache");
const tools_1 = require("./tools");
class ContextAction {
    constructor(values = {}) {
        lodash_1.each(values, (value, key) => {
            this[key] = value;
        });
    }
}
exports.ContextAction = ContextAction;
class ContextMemberAction extends ContextAction {
}
exports.ContextMemberAction = ContextMemberAction;
class ContextCollectionAction extends ContextAction {
}
exports.ContextCollectionAction = ContextCollectionAction;
class Context {
    static get(contextUrl, config) {
        config = config;
        let key = lodash_1.first(contextUrl.split('?'));
        let cachedContext;
        if (cachedContext = cache_1.Cache.runtime.fetch(config.getCacheKey(key))) {
            return cachedContext;
        }
        let dataPromise;
        let cachedData;
        if (!config.settings.devMode && !tools_1.Tools.isNode && (cachedData = cache_1.Cache.storage.fetch(config.getCacheKey(key)))) {
            dataPromise = Promise.resolve(cachedData);
        }
        else {
            dataPromise = new Promise((resolve, reject) => {
                var req = tools_1.Tools.req
                    .get(contextUrl)
                    .query({ t: config.settings.timestamp });
                if (config.getSessionId()) {
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
                req
                    .end((err, res) => {
                    if (err) {
                        const [handled, error] = tools_1.Tools.handleError(err, res, config);
                        return handled ? null : reject(error);
                    }
                    return resolve(res.body);
                });
            });
        }
        cachedContext = new Context(dataPromise);
        // when running a node web server, for multiple simultaneous requests of the same context
        // one could fail (e.g. with a 419). for this reason we cache only after a successful result
        // to avoid other users by coincidence get returned an error
        if (tools_1.Tools.isNode) {
            dataPromise.then((data) => {
                return cache_1.Cache.runtime.put(config.getCacheKey(key), cachedContext);
            });
        }
        else {
            dataPromise.then((data) => {
                return cache_1.Cache.storage.put(config.getCacheKey(key), data);
            });
            cache_1.Cache.runtime.put(config.getCacheKey(key), cachedContext);
        }
        return cachedContext;
    }
    constructor(dataPromise) {
        this.ready = dataPromise.then((data) => {
            this.data = data;
            lodash_1.each(this.properties, function (property, name) {
                property.isAssociation = property.type && /^(http|https)\:/.test(property.type);
            });
            return this;
        });
    }
    get context() {
        return this.data && this.data['@context'] || {};
    }
    get id() {
        return this.context['@id'];
    }
    get properties() {
        return this.context.properties || {};
    }
    get constants() {
        return this.context.constants || {};
    }
    property(name) {
        return this.properties[name];
    }
    constant(name) {
        return this.constants[name];
    }
    association(name) {
        var property = this.property(name);
        return property.isAssociation && property;
    }
    memberAction(name) {
        var action = this.context && this.context.member_actions && this.context.member_actions[name];
        if (!action) {
            console.log(`requested non-existing member action ${name}`);
            return;
        }
        return new ContextMemberAction(action);
    }
    collectionAction(name) {
        var action = this.context && this.context.collection_actions && this.context.collection_actions[name];
        if (!action) {
            console.log(`requested non-existing collection action ${name}`);
            return;
        }
        return new ContextCollectionAction(action);
    }
}
exports.Context = Context;
