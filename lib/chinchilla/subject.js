"use strict";
var lodash_1 = require('lodash');
var context_1 = require('./context');
var config_1 = require('./config');
var action_1 = require('./action');
var extractor_1 = require('./extractor');
var association_1 = require('./association');
var Subject = (function () {
    function Subject(objectsOrApp, model) {
        // unique id for this instance (for cache key purpose)
        this.id = Math.random().toString(36).substr(2, 9);
        // adds and initializes objects to this Subject
        if (lodash_1.isString(objectsOrApp)) {
            this.contextUrl = config_1.Config.endpoints[objectsOrApp] + "/context/" + model;
        }
        else {
            lodash_1.isArray(objectsOrApp) ? this.addObjects(objectsOrApp) : this.addObject(objectsOrApp);
        }
    }
    Subject.detachFromSubject = function (objects) {
        var detach = function (object) {
            var copy = lodash_1.clone(object);
            delete copy['$subject'];
            return copy;
        };
        if (lodash_1.isArray(objects)) {
            return lodash_1.map(objects, detach);
        }
        else if (lodash_1.isPlainObject(objects)) {
            return detach(objects);
        }
        return objects;
    };
    Subject.prototype.memberAction = function (name, inputParams, options) {
        var _this = this;
        var promise;
        return promise = this.context.ready.then(function (context) {
            var contextAction = context.memberAction(name);
            var mergedParams = lodash_1.merge({}, _this.objectParams, inputParams);
            var action = new action_1.Action(contextAction, mergedParams, _this.subject, options);
            promise['$objects'] = action.result.objects;
            return action.ready;
        });
    };
    // alias
    Subject.prototype.$m = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.memberAction.apply(this, args);
    };
    Subject.prototype.collectionAction = function (name, inputParams, options) {
        var _this = this;
        return this.context.ready.then(function (context) {
            var contextAction = context.collectionAction(name);
            var mergedParams = lodash_1.merge({}, _this.objectParams, inputParams);
            return new action_1.Action(contextAction, mergedParams, _this.subject, options).ready;
        });
    };
    // alias
    Subject.prototype.$c = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return this.collectionAction.apply(this, args);
    };
    Subject.prototype.$$ = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (this.subject && lodash_1.isArray(this.subject)) {
            return this.collectionAction.apply(this, args);
        }
        else {
            return this.memberAction.apply(this, args);
        }
    };
    // returns Association that resolves to a Result where the objects might belong to different Subjects
    Subject.prototype.association = function (name) {
        return association_1.Association.get(this, name);
    };
    // can be used to easily instantiate a new object with given context like this
    //
    // chch('um', 'user').new(first_name: 'Peter')
    Subject.prototype.new = function (attrs) {
        if (attrs === void 0) { attrs = {}; }
        this.subject = lodash_1.merge({ '@context': this.contextUrl, '$subject': this }, attrs);
        return this;
    };
    Object.defineProperty(Subject.prototype, "context", {
        get: function () {
            if (this._context)
                return this._context;
            return this._context = context_1.Context.get(this.contextUrl);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Subject.prototype, "objects", {
        get: function () {
            return lodash_1.isArray(this.subject) ? this.subject : [this.subject];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Subject.prototype, "object", {
        get: function () {
            return lodash_1.isArray(this.subject) ? lodash_1.first(this.subject) : this.subject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Subject.prototype, "objectParams", {
        get: function () {
            return extractor_1.Extractor.extractMemberParams(this.context, this.objects);
        },
        enumerable: true,
        configurable: true
    });
    Subject.prototype.addObjects = function (objects) {
        var _this = this;
        this.subject = [];
        lodash_1.each(objects, function (obj) {
            obj.$subject = _this;
            _this.moveAssociationReferences(obj);
            _this.initAssociationGetters(obj);
            _this.subject.push(obj);
        });
        this.contextUrl = this.object['@context'];
    };
    Subject.prototype.addObject = function (object) {
        object.$subject = this;
        this.moveAssociationReferences(object);
        this.initAssociationGetters(object);
        this.contextUrl = object['@context'];
        this.subject = object;
    };
    Subject.prototype.moveAssociationReferences = function (object) {
        if (!object.$associations)
            object.$associations = {};
        var key;
        for (key in object) {
            if (!object.hasOwnProperty(key))
                continue;
            var value = object[key];
            if (key === '$associations')
                continue;
            if (lodash_1.isArray(value)) {
                var el = lodash_1.first(value);
                if (lodash_1.isPlainObject(el) && el['@id']) {
                    // HABTM
                    object.$associations[key] = lodash_1.clone(value);
                    delete object[key];
                }
            }
            else if (lodash_1.isPlainObject(value) && value['@id']) {
                object.$associations[key] = lodash_1.clone(value);
                delete object[key];
            }
        }
    };
    Subject.prototype.initAssociationGetters = function (object) {
        var _this = this;
        if (!object.$associations)
            return;
        lodash_1.each(object.$associations, function (value, key) {
            var promiseKey = key + "Promise";
            Object.defineProperty(object, key, {
                get: function () {
                    return _this.association(key).getDataFor(object);
                },
                set: function (parent) { object.parent = parent; },
                configurable: key === 'parent'
            });
            Object.defineProperty(object, key + "Promise", {
                get: function () {
                    return _this.association(key).ready;
                }
            });
        });
    };
    return Subject;
}());
exports.Subject = Subject;
