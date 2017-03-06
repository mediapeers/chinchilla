"use strict";
const lodash_1 = require("lodash");
const request = require("superagent");
const config_1 = require("./config");
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
    constructor(contextUrl) {
        this.ready = new Promise((resolve, reject) => {
            var req = request
                .get(contextUrl)
                .query({ t: config_1.Config.timestamp });
            if (config_1.Config.getAffiliationId()) {
                req = req.set('Affiliation-Id', config_1.Config.getAffiliationId());
            }
            req
                .end((err, res) => {
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
    static get(contextUrl) {
        var key = lodash_1.first(contextUrl.split('?'));
        var cached;
        if (cached = Context.cache[key]) {
            return cached;
        }
        else {
            return Context.cache[key] = new Context(contextUrl);
        }
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
Context.cache = {};
exports.Context = Context;
