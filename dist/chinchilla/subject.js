"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const context_1 = require("./context");
const config_1 = require("./config");
const action_1 = require("./action");
const extractor_1 = require("./extractor");
const association_1 = require("./association");
const cache_1 = require("./cache");
class Subject {
    static detachFromSubject(objects) {
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
    }
    constructor(objectsOrApp, model) {
        this.id = cache_1.Cache.generateRandomKey('subject');
        // adds and initializes objects to this Subject
        if (lodash_1.isString(objectsOrApp)) {
            this.contextUrl = `${config_1.Config.endpoints[objectsOrApp]}/context/${model}`;
        }
        else {
            lodash_1.isArray(objectsOrApp) ? this.addObjects(objectsOrApp) : this.addObject(objectsOrApp);
        }
        /* disabled for now
        Cache.add(this.id, this)
        */
    }
    memberAction(name, inputParams, options) {
        var promise;
        return promise = this.context.ready.then((context) => {
            var contextAction = context.memberAction(name);
            var mergedParams = lodash_1.merge({}, this.objectParams, inputParams);
            var action = new action_1.Action(contextAction, mergedParams, this.subject, options);
            promise['$objects'] = action.result.objects;
            return action.ready;
        });
    }
    // alias
    $m(...args) {
        return this.memberAction.apply(this, args);
    }
    collectionAction(name, inputParams, options) {
        return this.context.ready.then((context) => {
            var contextAction = context.collectionAction(name);
            var mergedParams = lodash_1.merge({}, this.objectParams, inputParams);
            return new action_1.Action(contextAction, mergedParams, this.subject, options).ready;
        });
    }
    // alias
    $c(...args) {
        return this.collectionAction.apply(this, args);
    }
    $$(...args) {
        if (this.subject && lodash_1.isArray(this.subject)) {
            return this.collectionAction.apply(this, args);
        }
        else {
            return this.memberAction.apply(this, args);
        }
    }
    // returns Association that resolves to a Result where the objects might belong to different Subjects
    association(name) {
        return association_1.Association.get(this, name);
    }
    // can be used to easily instantiate a new object with given context like this
    //
    // chch('um', 'user').new(first_name: 'Peter')
    new(attrs = {}) {
        this.subject = lodash_1.merge({ '@context': this.contextUrl, '$subject': this.id }, attrs);
        return this;
    }
    get context() {
        if (this._context)
            return this._context;
        return this._context = context_1.Context.get(this.contextUrl);
    }
    get objects() {
        return lodash_1.isArray(this.subject) ? this.subject : [this.subject];
    }
    get object() {
        return lodash_1.isArray(this.subject) ? lodash_1.first(this.subject) : this.subject;
    }
    get objectParams() {
        return extractor_1.Extractor.extractMemberParams(this.context, this.objects);
    }
    destroy() {
        lodash_1.each(this.objects, (object) => {
            for (var key in object) {
                delete object[key];
            }
        });
        for (var key in this) {
            delete this[key];
        }
    }
    addObjects(objects) {
        this.subject = [];
        lodash_1.each(objects, (obj) => {
            obj.$subject = this.id;
            this.moveAssociationReferences(obj);
            this.initAssociationGetters(obj);
            this.subject.push(obj);
        });
        this.contextUrl = this.object['@context'];
    }
    addObject(object) {
        object.$subject = this.id;
        this.moveAssociationReferences(object);
        this.initAssociationGetters(object);
        this.contextUrl = object['@context'];
        this.subject = object;
    }
    moveAssociationReferences(object) {
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
    }
    initAssociationGetters(object) {
        if (!object.$associations)
            return;
        lodash_1.each(object.$associations, (value, key) => {
            var promiseKey = `${key}Promise`;
            Object.defineProperty(object, key, {
                get: () => {
                    return this.association(key).getDataFor(object);
                }
            });
            Object.defineProperty(object, `${key}Promise`, {
                get: () => {
                    return this.association(key).ready;
                }
            });
        });
    }
}
exports.Subject = Subject;
