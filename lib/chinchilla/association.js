"use strict";
var lodash_1 = require('lodash');
var context_1 = require('./context');
var action_1 = require('./action');
var extractor_1 = require('./extractor');
var Association = (function () {
    function Association(subject, name) {
        var _this = this;
        this.habtm = false;
        // this cache contains the association data for each of the subject's objects
        this.cache = {};
        this.subject = subject;
        this.name = name;
        this.associationData = this.readAssociationData();
        // array of arrays => HABTM!
        this.habtm = lodash_1.isArray(lodash_1.first(this.associationData));
        if (this.habtm)
            this.associationData = lodash_1.flatten(this.associationData);
        this.ready = this.subject.context.ready.then(function (context) {
            _this.associationProperty = context.association(name);
            return context_1.Context.get(_this.associationProperty.type).ready.then(function (associationContext) {
                _this.context = associationContext;
                var contextAction = _this.associationData.length > 1 || _this.associationProperty.collection ?
                    associationContext.collectionAction('get') :
                    associationContext.memberAction('get');
                if (!contextAction)
                    throw new Error("could not load association " + name);
                //var extractedParams = Extractor.extractCollectionParams(this.subject.context, this.subject.objects)
                //TODO is ^^ this needed?
                return new action_1.Action(contextAction, _this.associationParams, {}).ready.then(function (result) {
                    _this.fillCache(result);
                    return result;
                });
            });
        });
    }
    // instances of Association get cached for every Subject. this means for any Subject the association data
    // is loaded only once. however it is possible to have multiple Subjects containing the same objects and each of
    // them loads their associations individually
    Association.get = function (subject, name) {
        var key = "subject-" + subject.id + "-" + name;
        var instance;
        if (instance = Association.cache[key]) {
            return instance;
        }
        else {
            instance = new Association(subject, name);
            Association.cache[key] = instance;
            return instance;
        }
    };
    Association.prototype.getDataFor = function (object) {
        var key = object && object['@id'];
        if (!key)
            return;
        if (this.associationProperty && this.associationProperty.collection && !this.cache[key]) {
            return this.cache[key] = [];
        }
        return this.cache[key];
    };
    // after association data has been retrieved this function sorts result data into cache where the cache key
    // if the parent (subject's) objects id
    Association.prototype.fillCache = function (result) {
        var _this = this;
        if (this.associationProperty.collection) {
            if (this.habtm) {
                // HAS AND BELONGS TO MANY
                var sorted = {};
                lodash_1.each(result.objects, function (obj) {
                    sorted[obj['@id']] = obj;
                });
                lodash_1.each(this.subject.objects, function (obj) {
                    var key = obj['@id'];
                    _this.cache[key] = [];
                    var references = obj.$associations && obj.$associations[_this.name];
                    if (!lodash_1.isArray(references))
                        return true;
                    lodash_1.each(references, function (reference) {
                        var result = sorted[reference['@id']];
                        if (!result)
                            return true;
                        _this.cache[key].push(result);
                    });
                });
            }
            else {
                // HAS MANY
                // find back reference association, -> association that points to same context the parent context does
                // say you want to load user phones..
                // - @$operation is a user action operation, which $context is the user context
                // - @contextOperation.$context is the phone context
                // - -> find the association inside of phone context which points to @id of user context
                // 1. attempt: try to find association name using parent context id in own associations
                var associationName;
                associationName = lodash_1.findKey(this.context.properties, function (value, key) {
                    return value && value.type && value.type === _this.subject.context.id;
                });
                // 2. attempt: try to find association name using inverse_of if given
                if (!associationName) {
                    associationName = lodash_1.findKey(this.context.properties, function (value, key) {
                        return value && value.inverse_of && value.inverse_of === _this.name;
                    });
                }
                lodash_1.each(result.objects, function (obj) {
                    var backReference = obj && obj.$associations && obj.$associations[associationName] && obj.$associations[associationName]['@id'];
                    if (!backReference)
                        return;
                    if (!_this.cache[backReference])
                        _this.cache[backReference] = [];
                    _this.cache[backReference].push(obj);
                });
            }
        }
        else {
            // HAS ONE / BELONGS TO
            var sorted = {};
            lodash_1.each(result.objects, function (obj) {
                sorted[obj['@id']] = obj;
            });
            lodash_1.each(this.subject.objects, function (obj) {
                var requestedId = obj.$associations && obj.$associations[_this.name] && obj.$associations[_this.name]['@id'];
                if (!requestedId)
                    return;
                var result = sorted[requestedId];
                if (!result)
                    return;
                _this.cache[obj['@id']] = result;
            });
        }
    };
    Object.defineProperty(Association.prototype, "associationParams", {
        get: function () {
            if (this.habtm) {
                return extractor_1.Extractor.extractMemberParams(this.context, lodash_1.flatten(this.associationData));
            }
            else if (this.associationProperty.collection) {
                return extractor_1.Extractor.extractCollectionParams(this.context, this.associationData);
            }
            else {
                return extractor_1.Extractor.extractMemberParams(this.context, this.associationData);
            }
        },
        enumerable: true,
        configurable: true
    });
    // extract reference data from parent objects
    Association.prototype.readAssociationData = function () {
        var name = this.name;
        var assocData = function (obj) {
            return obj && obj.$associations && obj.$associations[name];
        };
        return lodash_1.map(this.subject.objects, function (obj) {
            return assocData(obj);
        });
    };
    // this is a cache for all Association instances
    Association.cache = {};
    return Association;
}());
exports.Association = Association;
