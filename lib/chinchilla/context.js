"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lodash_1 = require('lodash');
var request = require('superagent');
var config_1 = require('./config');
var Promise = require('bluebird');
var ContextAction = (function () {
    function ContextAction(values) {
        var _this = this;
        if (values === void 0) { values = {}; }
        lodash_1.each(values, function (value, key) {
            _this[key] = value;
        });
    }
    return ContextAction;
}());
exports.ContextAction = ContextAction;
var ContextMemberAction = (function (_super) {
    __extends(ContextMemberAction, _super);
    function ContextMemberAction() {
        _super.apply(this, arguments);
    }
    return ContextMemberAction;
}(ContextAction));
exports.ContextMemberAction = ContextMemberAction;
var ContextCollectionAction = (function (_super) {
    __extends(ContextCollectionAction, _super);
    function ContextCollectionAction() {
        _super.apply(this, arguments);
    }
    return ContextCollectionAction;
}(ContextAction));
exports.ContextCollectionAction = ContextCollectionAction;
var Context = (function () {
    function Context(contextUrl) {
        var _this = this;
        this.ready = new Promise(function (resolve, reject) {
            request
                .get(contextUrl)
                .query({ t: config_1.Config.timestamp })
                .end(function (err, res) {
                _this.data = res.body;
                _this.context = res.body && res.body['@context'] || {};
                _this.id = _this.context['@id'];
                _this.properties = _this.context.properties || {};
                _this.constants = _this.context.constants || {};
                lodash_1.each(_this.properties, function (property, name) {
                    property.isAssociation = property.type && /^(http|https)\:/.test(property.type);
                });
                resolve(_this);
            });
        });
    }
    Context.get = function (contextUrl) {
        var key = lodash_1.first(contextUrl.split('?'));
        var cached;
        if (cached = Context.cache[key]) {
            return cached;
        }
        else {
            return Context.cache[key] = new Context(contextUrl);
        }
    };
    Context.prototype.property = function (name) {
        return this.properties[name];
    };
    Context.prototype.constant = function (name) {
        return this.constants[name];
    };
    Context.prototype.association = function (name) {
        var property = this.property(name);
        return property.isAssociation && property;
    };
    Context.prototype.memberAction = function (name) {
        var action = this.context && this.context.member_actions && this.context.member_actions[name];
        if (!action) {
            console.log("requested non-existing member action " + name);
            return;
        }
        return new ContextMemberAction(action);
    };
    Context.prototype.collectionAction = function (name) {
        var action = this.context && this.context.collection_actions && this.context.collection_actions[name];
        if (!action) {
            console.log("requested non-existing collection action " + name);
            return;
        }
        return new ContextCollectionAction(action);
    };
    Context.cache = {};
    return Context;
}());
exports.Context = Context;
