/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const Kekse = __webpack_require__(11);
class Cookies {
    static get(...args) {
        return (typeof window === undefined) ?
            Kekse.get.apply(null, args) : null;
    }
    static set(...args) {
        return (typeof window === undefined) ?
            Kekse.set.apply(null, args) : null;
    }
    static expire(...args) {
        return (typeof window === undefined) ?
            Kekse.expire.apply(null, args) : null;
    }
}
exports.Cookies = Cookies;
class Config {
    // timestamp to be appended to every request
    // will be the same for a session lifetime
    static setEndpoint(name, url) {
        Config.endpoints[name] = url;
    }
    static setCookieDomain(domain) {
        Config.domain = domain;
    }
    static setErrorInterceptor(fn) {
        Config.errorInterceptor = fn;
    }
    static setAffiliationId(id) {
        Config.setValue('affiliationId', id);
    }
    static getAffiliationId() {
        return Config.getValue('affiliationId');
    }
    static clearAffiliationId() {
        Config.clearValue('affiliationId');
    }
    static setSessionId(id) {
        Config.setValue('sessionId', id);
    }
    static getSessionId() {
        return Config.getValue('sessionId');
    }
    static clearSessionId() {
        Config.clearValue('sessionId');
    }
    static getValue(name) {
        return Config[name] || Cookies.get(Config.cookieKey(name));
    }
    static setValue(name, value) {
        Config[name] = value;
        Cookies.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: 300 });
    }
    static clearValue(name) {
        Cookies.expire(Config.cookieKey(name), { domain: Config.domain });
    }
    static cookieKey(name) {
        return `chinchilla.${name}`;
    }
}
Config.endpoints = {};
Config.timestamp = Date.now() / 1000 | 0;
exports.Config = Config;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const lodash_1 = __webpack_require__(0);
const request = __webpack_require__(6);
const config_1 = __webpack_require__(1);
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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const lodash_1 = __webpack_require__(0);
const UriTemplate = __webpack_require__(7);
class Extractor {
    static extractMemberParams(context, obj) {
        var action = context.memberAction('get');
        return Extractor.extractParams(action, obj);
    }
    static extractCollectionParams(context, obj) {
        var action = context.collectionAction('query');
        return Extractor.extractParams(action, obj);
    }
    // expands given params to include variable mappings in addition
    // for this input:
    // { id: 4 }
    // and this template:
    // http//server/user/{user_id}
    // with mapping
    // { source: id, variable: user_id }
    //
    // the returned object would be:
    // { id: 4, user_id: 4 }
    static uriParams(action, params = {}) {
        var uriParams = lodash_1.clone(params);
        lodash_1.each(action.mappings, (mapping) => {
            if (!uriParams[mapping.variable])
                uriParams[mapping.variable] = params[mapping.source];
        });
        return uriParams;
    }
    static extractParams(contextAction, obj) {
        if (lodash_1.isEmpty(obj) || lodash_1.isEmpty(contextAction))
            return {};
        if (lodash_1.isArray(obj)) {
            return Extractor.extractArrayValues(contextAction, obj);
        }
        else {
            return Extractor.extractValues(contextAction, obj);
        }
    }
    static extractValues(contextAction, object) {
        var id = object && object['@id'];
        if (!id)
            return {};
        var result = {};
        var template = new UriTemplate(contextAction.template);
        var values = template.fromUri(id);
        if (lodash_1.isEmpty(values))
            return {};
        lodash_1.each(contextAction.mappings, (mapping) => {
            var value = values[mapping.variable];
            if (!value)
                return;
            result[mapping.source] = value;
        });
        return result;
    }
    static extractArrayValues(contextAction, objects) {
        var values = lodash_1.map(objects, (obj) => {
            return Extractor.extractValues(contextAction, obj);
        });
        values = lodash_1.compact(values);
        var result = {};
        lodash_1.each(contextAction.mappings, (mapping) => {
            result[mapping.source] = [];
            lodash_1.each(values, (attrs) => {
                if (!attrs[mapping.source])
                    return;
                if (lodash_1.include(result[mapping.source], attrs[mapping.source]))
                    return;
                result[mapping.source].push(attrs[mapping.source]);
            });
        });
        return result;
    }
}
exports.Extractor = Extractor;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const lodash_1 = __webpack_require__(0);
const request = __webpack_require__(6);
const UriTemplate = __webpack_require__(7);
const config_1 = __webpack_require__(1);
const result_1 = __webpack_require__(10);
const extractor_1 = __webpack_require__(3);
class Action {
    constructor(contextAction, params = {}, body, options) {
        this.result = new result_1.Result();
        this.contextAction = contextAction;
        this.uriTmpl = new UriTemplate(contextAction.template);
        this.params = extractor_1.Extractor.uriParams(contextAction, params);
        this.options = options;
        // reformat body to match rails API
        this.body = this.formatBody(body);
        this.ready = new Promise((resolve, reject) => {
            var uri = this.uriTmpl.fillFromObject(this.params);
            var req;
            switch (contextAction.method) {
                case 'GET':
                    req = request.get(uri);
                    break;
                case 'POST':
                    req = request.post(uri)
                        .send(this.body);
                    break;
                case 'PUT':
                    req = request.put(uri)
                        .send(this.body);
                    break;
                case 'PATCH':
                    req = request.patch(uri)
                        .send(this.body);
                    break;
                case 'DELETE':
                    req = request.del(uri);
                    break;
            }
            // add timestamp
            req = req.query({ t: config_1.Config.timestamp });
            // add session by default
            if (!options || !(options.withoutSession === true)) {
                req = req.set('Session-Id', config_1.Config.getSessionId());
            }
            // add affiliation if configured
            if (config_1.Config.getAffiliationId()) {
                req = req.set('Affiliation-Id', config_1.Config.getAffiliationId());
            }
            // add custom headers
            if (options && (options.header || options.headers)) {
                let headers = options.headers || options.header;
                if (typeof headers === 'string')
                    req.set(headers, 'true');
                else if (typeof headers === 'object')
                    for (var key in headers)
                        req.set(key, headers[key]);
            }
            req.end((err, res) => {
                if (err) {
                    var error = new result_1.ErrorResult(err.response ? err.response.text : 'No error details available.').error(res);
                    error.stack = err.stack;
                    if (config_1.Config.errorInterceptor) {
                        // if error interceptor returns true, then abort (don't resolve nor reject)
                        if (config_1.Config.errorInterceptor(error))
                            return;
                    }
                    return reject(error);
                }
                this.result.success(res);
                resolve(this.result);
            });
        });
    }
    formatBody(body) {
        if (lodash_1.isEmpty(body))
            return;
        var formatted = {};
        if (this.options && (this.options.raw === true)) {
            formatted = this.cleanupObject(body);
        }
        else if (lodash_1.isArray(body)) {
            lodash_1.each(body, (obj) => {
                formatted[obj.id] = this.remapAttributes(this.cleanupObject(obj));
            });
        }
        else {
            formatted = this.remapAttributes(this.cleanupObject(body));
        }
        return formatted;
    }
    // cleans the object to be send
    // * rejects attributes starting with $
    // * rejects validation errors and isPristine attribute
    // * rejects js functions
    // * rejects empty objects {}
    // * rejects empty objects within array [{}]
    cleanupObject(object) {
        if (lodash_1.isEmpty(object))
            return {};
        var cleaned = {};
        lodash_1.each(object, (value, key) => {
            if (/^\$/.test(key) || key === 'errors' || key === 'isPristine' || lodash_1.isFunction(value)) {
            }
            else if (lodash_1.isArray(value)) {
                if (lodash_1.isPlainObject(value[0])) {
                    var subset = lodash_1.map(value, (x) => {
                        return this.cleanupObject(x);
                    });
                    cleaned[key] = lodash_1.reject(subset, (x) => {
                        return lodash_1.isEmpty(x);
                    });
                }
                else {
                    cleaned[key] = value;
                }
            }
            else if (lodash_1.isPlainObject(value)) {
                var cleanedValue = this.cleanupObject(value);
                if (!lodash_1.isEmpty(cleanedValue))
                    cleaned[key] = cleanedValue;
            }
            else {
                cleaned[key] = value;
            }
        });
        return cleaned;
    }
    remapAttributes(object) {
        lodash_1.each(object, (value, key) => {
            // split csv string to array
            if (lodash_1.isString(value) && /_ids$/.test(key)) {
                var values = lodash_1.select(value.split(','), (item) => {
                    return !lodash_1.isEmpty(item);
                });
                object[key] = values;
            }
            else if (lodash_1.isPlainObject(value) || (lodash_1.isArray(value) && lodash_1.isPlainObject(lodash_1.first(value)))) {
                object[`${key}_attributes`] = value;
                delete object[key];
            }
        });
        return object;
    }
}
exports.Action = Action;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const lodash_1 = __webpack_require__(0);
const context_1 = __webpack_require__(2);
const config_1 = __webpack_require__(1);
const action_1 = __webpack_require__(4);
const extractor_1 = __webpack_require__(3);
const association_1 = __webpack_require__(9);
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
        // unique id for this instance (for cache key purpose)
        this.id = Math.random().toString(36).substr(2, 9);
        // adds and initializes objects to this Subject
        if (lodash_1.isString(objectsOrApp)) {
            this.contextUrl = `${config_1.Config.endpoints[objectsOrApp]}/context/${model}`;
        }
        else {
            lodash_1.isArray(objectsOrApp) ? this.addObjects(objectsOrApp) : this.addObject(objectsOrApp);
        }
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
        this.subject = lodash_1.merge({ '@context': this.contextUrl, '$subject': this }, attrs);
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
    addObjects(objects) {
        this.subject = [];
        lodash_1.each(objects, (obj) => {
            obj.$subject = this;
            this.moveAssociationReferences(obj);
            this.initAssociationGetters(obj);
            this.subject.push(obj);
        });
        this.contextUrl = this.object['@context'];
    }
    addObject(object) {
        object.$subject = this;
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
                },
                set: (parent) => { object.parent = parent; },
                configurable: key === 'parent'
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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("superagent");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("uri-templates");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const lodash_1 = __webpack_require__(0);
const subject_1 = __webpack_require__(5);
const config_1 = __webpack_require__(1);
const context_1 = __webpack_require__(2);
class chch {
    static subject(objectsOrApp, model) {
        // detach from existing Subject first before creating a new one..
        objectsOrApp = subject_1.Subject.detachFromSubject(objectsOrApp);
        return new subject_1.Subject(objectsOrApp, model);
    }
    static new(app, model, attrs = {}) {
        return lodash_1.merge({ '@context': `${config_1.Config.endpoints[app]}/context/${model}` }, attrs);
    }
    static contextUrl(app, model) {
        return `${config_1.Config.endpoints[app]}/context/${model}`;
    }
    static context(urlOrApp, model) {
        if (!model) {
            // assume first param is the context url
            return context_1.Context.get(urlOrApp).ready;
        }
        else {
            return context_1.Context.get(`${config_1.Config.endpoints[urlOrApp]}/context/${model}`).ready;
        }
    }
}
chch.config = config_1.Config;
// unfurl('pm, 'product', 'query', params) -> defaults to $c
// unfurl('pm, 'product', '$c:query', params)
// unfurl('pm, 'product', '$m:query_descendants', params)
chch.unfurl = function (app, model, actionName, params) {
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


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const lodash_1 = __webpack_require__(0);
const context_1 = __webpack_require__(2);
const action_1 = __webpack_require__(4);
const extractor_1 = __webpack_require__(3);
class Association {
    constructor(subject, name) {
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
        this.ready = this.subject.context.ready.then((context) => {
            this.associationProperty = context.association(name);
            return context_1.Context.get(this.associationProperty.type).ready.then((associationContext) => {
                this.context = associationContext;
                var contextAction = this.associationData.length > 1 || this.associationProperty.collection ?
                    associationContext.collectionAction('get') :
                    associationContext.memberAction('get');
                if (!contextAction)
                    throw new Error(`could not load association ${name}`);
                //var extractedParams = Extractor.extractCollectionParams(this.subject.context, this.subject.objects)
                //TODO is ^^ this needed?
                return new action_1.Action(contextAction, this.associationParams, {}).ready.then((result) => {
                    this.fillCache(result);
                    return result;
                });
            });
        });
    }
    // instances of Association get cached for every Subject. this means for any Subject the association data
    // is loaded only once. however it is possible to have multiple Subjects containing the same objects and each of
    // them loads their associations individually
    static get(subject, name) {
        var key = `subject-${subject.id}-${name}`;
        var instance;
        if (instance = Association.cache[key]) {
            return instance;
        }
        else {
            instance = new Association(subject, name);
            Association.cache[key] = instance;
            return instance;
        }
    }
    getDataFor(object) {
        var key = object && object['@id'];
        if (!key)
            return;
        if (this.associationProperty && this.associationProperty.collection && !this.cache[key]) {
            return this.cache[key] = [];
        }
        return this.cache[key];
    }
    // after association data has been retrieved this function sorts result data into cache where the cache key
    // if the parent (subject's) objects id
    fillCache(result) {
        if (this.associationProperty.collection) {
            if (this.habtm) {
                // HAS AND BELONGS TO MANY
                var sorted = {};
                lodash_1.each(result.objects, (obj) => {
                    sorted[obj['@id']] = obj;
                });
                lodash_1.each(this.subject.objects, (obj) => {
                    var key = obj['@id'];
                    this.cache[key] = [];
                    var references = obj.$associations && obj.$associations[this.name];
                    if (!lodash_1.isArray(references))
                        return true;
                    lodash_1.each(references, (reference) => {
                        var result = sorted[reference['@id']];
                        if (!result)
                            return true;
                        this.cache[key].push(result);
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
                associationName = lodash_1.findKey(this.context.properties, (value, key) => {
                    return value && value.type && value.type === this.subject.context.id;
                });
                // 2. attempt: try to find association name using inverse_of if given
                if (!associationName) {
                    associationName = lodash_1.findKey(this.context.properties, (value, key) => {
                        return value && value.inverse_of && value.inverse_of === this.name;
                    });
                }
                lodash_1.each(result.objects, (obj) => {
                    var backReference = obj && obj.$associations && obj.$associations[associationName] && obj.$associations[associationName]['@id'];
                    if (!backReference)
                        return;
                    if (!this.cache[backReference])
                        this.cache[backReference] = [];
                    this.cache[backReference].push(obj);
                });
            }
        }
        else {
            // HAS ONE / BELONGS TO
            var sorted = {};
            lodash_1.each(result.objects, (obj) => {
                sorted[obj['@id']] = obj;
            });
            lodash_1.each(this.subject.objects, (obj) => {
                var requestedId = obj.$associations && obj.$associations[this.name] && obj.$associations[this.name]['@id'];
                if (!requestedId)
                    return;
                var result = sorted[requestedId];
                if (!result)
                    return;
                this.cache[obj['@id']] = result;
            });
        }
    }
    get associationParams() {
        if (this.habtm) {
            return extractor_1.Extractor.extractMemberParams(this.context, lodash_1.flatten(this.associationData));
        }
        else if (this.associationProperty.collection) {
            return extractor_1.Extractor.extractCollectionParams(this.context, this.associationData);
        }
        else {
            return extractor_1.Extractor.extractMemberParams(this.context, this.associationData);
        }
    }
    // extract reference data from parent objects
    readAssociationData() {
        var name = this.name;
        var assocData = function (obj) {
            return obj && obj.$associations && obj.$associations[name];
        };
        return lodash_1.map(this.subject.objects, function (obj) {
            return assocData(obj);
        });
    }
}
// this is a cache for all Association instances
Association.cache = {};
exports.Association = Association;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const lodash_1 = __webpack_require__(0);
const subject_1 = __webpack_require__(5);
class Result {
    constructor() {
        this.objects = [];
        this.objects_raw = [];
    }
    success(result) {
        this.headers = result.headers;
        if (result.body) {
            this.type = result.body['@type'];
            this.aggregations = result.body['aggregations'];
        }
        switch (this.type) {
            case 'graph':
                var members = result.body['@graph'];
                if (!members)
                    return;
                this.objects_raw = members;
                new subject_1.Subject(members);
                lodash_1.each(members, (node) => {
                    if (node.parent_id) {
                        // this is a child
                        var parent = lodash_1.find(members, (x) => {
                            return x.id === node.parent_id;
                        });
                        if (parent) {
                            if (!parent.children)
                                parent.children = [];
                            parent.children.push(node);
                        }
                        return true; // continue loop
                    }
                    else {
                        // root
                        this.objects.push(node);
                    }
                });
                break;
            case 'collection':
            case 'search_collection':
                lodash_1.each(result.body.members, (member) => {
                    this.objects.push(member);
                });
                var byContext = lodash_1.groupBy(this.objects, '@context');
                // creates new Subject for each group ob objects that share the same @context
                lodash_1.each(byContext, (objects, context) => {
                    new subject_1.Subject(objects);
                });
                break;
            default:
                if (lodash_1.isArray(result.body))
                    throw new Error("Unexpectedly got an array");
                if (lodash_1.isEmpty(result.body))
                    break;
                this.objects.push(result.body);
                new subject_1.Subject(this.object);
                break;
        }
    }
    get object() {
        return lodash_1.first(this.objects);
    }
}
exports.Result = Result;
class ErrorResult extends Error {
    constructor(message) {
        super(message);
    }
    error(result) {
        this.headers = result.headers;
        this.object = result.body;
        this.statusCode = result.statusCode;
        this.statusText = result.statusText;
        this.url = result.req.url;
        this.method = result.req.method;
        return this;
    }
}
exports.ErrorResult = ErrorResult;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("cookies-js");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const chinchilla_1 = __webpack_require__(8);
window['chch'] = chinchilla_1.default.subject;
window['chch'].new = chinchilla_1.default.new;
window['chch'].context = chinchilla_1.default.context;
window['chch'].config = chinchilla_1.default.config;
window['chch'].contextUrl = chinchilla_1.default.contextUrl;
window['chch'].unfurl = chinchilla_1.default.unfurl;


/***/ })
/******/ ]);