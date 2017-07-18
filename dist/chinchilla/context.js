"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const request = require("superagent");
const config_1 = require("./config");
const cache_1 = require("./cache");
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
    static get(contextUrl) {
        let key = cache_1.Cache.generateSessionKey(lodash_1.first(contextUrl.split('?')));
        let cached;
        if (cached = cache_1.Cache.get(key)) {
            return cached;
        }
        else {
            let context = new Context(contextUrl);
            cache_1.Cache.add(key, context);
            return context;
        }
    }
    constructor(contextUrl) {
        this.ready = new Promise((resolve, reject) => {
            var req = request
                .get(contextUrl)
                .query({ t: config_1.Config.timestamp });
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
                this.data = res.body;
                this.context = res.body && res.body['@context'] || {};
                this.id = this.context['@id'];
                this.properties = this.context.properties || {};
                this.constants = this.context.constants || {};
                lodash_1.each(this.properties, function (property, name) {
                    property.isAssociation = property.type && /^(http|https)\:/.test(property.type);
                });
                resolve(this);
            });
        });
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
