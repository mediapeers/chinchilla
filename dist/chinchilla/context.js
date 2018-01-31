"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Promise = require("bluebird");
const config_1 = require("./config");
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
    constructor(dataPromise) {
        this.ready = dataPromise.then((data) => {
            this.data = data;
            lodash_1.each(this.properties, function (property, name) {
                property.isAssociation = property.type && /^(http|https)\:/.test(property.type);
            });
            return this;
        });
    }
    static get(contextUrl) {
        let key = lodash_1.first(contextUrl.split('?'));
        let cachedContext;
        if (cachedContext = cache_1.Cache.runtime.get(key)) {
            console.log('context: got from runtime cache', key);
            return cachedContext;
        }
        let dataPromise;
        let cachedData;
        if (!tools_1.Tools.isNode && (cachedData = cache_1.Cache.storage.get(key))) {
            console.log('context: got from storage cache', key);
            dataPromise = Promise.resolve(cachedData);
        }
        else {
            console.log('context: fetch', key);
            dataPromise = new Promise((resolve, reject) => {
                var req = tools_1.Tools.req
                    .get(contextUrl);
                if (config_1.Config.getAffiliationId()) {
                    req = req.set('Affiliation-Id', config_1.Config.getAffiliationId());
                }
                if (config_1.Config.getSessionId()) {
                    req = req.set('Session-Id', config_1.Config.getSessionId());
                }
                req
                    .end((err, res) => {
                    if (err)
                        return reject(err);
                    return resolve(res.body);
                });
            });
        }
        if (!tools_1.Tools.isNode) {
            dataPromise.then((data) => {
                return cache_1.Cache.storage.set(key, data);
            });
        }
        cachedContext = new Context(dataPromise);
        cache_1.Cache.runtime.set(key, cachedContext);
        return cachedContext;
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
Context.cache = {}; // promise cache
exports.Context = Context;
