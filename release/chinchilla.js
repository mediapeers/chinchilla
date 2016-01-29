/// <reference path = "../../typings/promise.d.ts" />
var Chinchilla;
(function (Chinchilla) {
    var Config = (function () {
        function Config() {
        }
        // timestamp to be appended to every request
        // will be the same for a session lifetime
        Config.setEndpoint = function (name, url) {
            Config.endpoints[name] = url;
        };
        Config.setCookieDomain = function (domain) {
            Config.domain = domain;
        };
        Config.setSessionId = function (id) {
            Cookies.set(Config.sessionKey, id, { path: '/', domain: Config.domain, expires: 300 });
        };
        Config.setErrorInterceptor = function (fn) {
            Config.errorInterceptor = fn;
        };
        Config.getSessionId = function () {
            return Cookies.get(Config.sessionKey);
        };
        Config.clearSessionId = function () {
            Cookies.remove(Config.sessionKey, { domain: Config.domain });
        };
        Config.endpoints = {};
        Config.timestamp = Date.now() / 1000 | 0;
        Config.sessionKey = 'chinchillaSessionId';
        return Config;
    })();
    Chinchilla.Config = Config;
})(Chinchilla || (Chinchilla = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "config.ts" />
var Chinchilla;
(function (Chinchilla) {
    var ContextAction = (function () {
        function ContextAction(values) {
            var _this = this;
            if (values === void 0) { values = {}; }
            _.each(values, function (value, key) {
                _this[key] = value;
            });
        }
        return ContextAction;
    })();
    Chinchilla.ContextAction = ContextAction;
    var ContextMemberAction = (function (_super) {
        __extends(ContextMemberAction, _super);
        function ContextMemberAction() {
            _super.apply(this, arguments);
        }
        return ContextMemberAction;
    })(ContextAction);
    Chinchilla.ContextMemberAction = ContextMemberAction;
    var ContextCollectionAction = (function (_super) {
        __extends(ContextCollectionAction, _super);
        function ContextCollectionAction() {
            _super.apply(this, arguments);
        }
        return ContextCollectionAction;
    })(ContextAction);
    Chinchilla.ContextCollectionAction = ContextCollectionAction;
    var Context = (function () {
        function Context(contextUrl) {
            var _this = this;
            this.ready = new Promise(function (resolve, reject) {
                request
                    .get(contextUrl)
                    .query({ t: Chinchilla.Config.timestamp })
                    .end(function (err, res) {
                    _this.data = res.body;
                    _this.context = res.body && res.body['@context'] || {};
                    _this.id = _this.context['@id'];
                    _this.properties = _this.context.properties || {};
                    _this.constants = _this.context.constants || {};
                    _.each(_this.properties, function (property, name) {
                        property.isAssociation = property.type && /^(http|https)\:/.test(property.type);
                    });
                    resolve(_this);
                });
            });
        }
        Context.get = function (contextUrl) {
            var key = _.first(contextUrl.split('?'));
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
    })();
    Chinchilla.Context = Context;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "subject.ts" />
var Chinchilla;
(function (Chinchilla) {
    var Result = (function () {
        function Result() {
            this.objects = [];
        }
        Result.prototype.success = function (result) {
            var _this = this;
            this.headers = result.headers;
            switch (result.body && result.body['@type']) {
                case 'graph':
                    var members = result.body['@graph'];
                    if (!members)
                        return;
                    new Chinchilla.Subject(members);
                    _.each(members, function (node) {
                        if (node.parent_id) {
                            // this is a child
                            var parent = _.find(members, function (x) {
                                return x.id === node.parent_id;
                            });
                            if (parent) {
                                node.parent = parent;
                                if (!parent.children)
                                    parent.children = [];
                                parent.children.push(node);
                            }
                            return true; // continue loop
                        }
                        else {
                            // root
                            _this.objects.push(node);
                        }
                    });
                    break;
                case 'collection':
                case 'search_collection':
                    _.each(result.body.members, function (member) {
                        _this.objects.push(member);
                    });
                    var byContext = _.groupBy(this.objects, '@context');
                    // creates new Subject for each group ob objects that share the same @context
                    _.each(byContext, function (objects, context) {
                        new Chinchilla.Subject(objects);
                    });
                    break;
                default:
                    if (_.isArray(result.body))
                        throw new Error("Unexpectedly got an array");
                    if (_.isEmpty(result.body))
                        break;
                    this.objects.push(result.body);
                    new Chinchilla.Subject(this.object);
                    break;
            }
        };
        Object.defineProperty(Result.prototype, "object", {
            get: function () {
                return _.first(this.objects);
            },
            enumerable: true,
            configurable: true
        });
        return Result;
    })();
    Chinchilla.Result = Result;
    var ErrorResult = (function (_super) {
        __extends(ErrorResult, _super);
        function ErrorResult() {
            _super.apply(this, arguments);
        }
        ErrorResult.prototype.error = function (result) {
            this.headers = result.headers;
            this.object = result.body;
            this.statusCode = result.statusCode;
            this.statusText = result.statusText;
            this.url = result.req.url;
            this.method = result.req.method;
            return this;
        };
        return ErrorResult;
    })(Error);
    Chinchilla.ErrorResult = ErrorResult;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "../../typings/uriTemplate.d.ts" />
/// <reference path = "context.ts" />
var Chinchilla;
(function (Chinchilla) {
    var Extractor = (function () {
        function Extractor() {
        }
        Extractor.extractMemberParams = function (context, obj) {
            var action = context.memberAction('get');
            return Extractor.extractParams(action, obj);
        };
        Extractor.extractCollectionParams = function (context, obj) {
            var action = context.collectionAction('query');
            return Extractor.extractParams(action, obj);
        };
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
        Extractor.uriParams = function (action, params) {
            if (params === void 0) { params = {}; }
            var uriParams = _.clone(params);
            _.each(action.mappings, function (mapping) {
                if (!uriParams[mapping.variable])
                    uriParams[mapping.variable] = params[mapping.source];
            });
            return uriParams;
        };
        Extractor.extractParams = function (contextAction, obj) {
            if (_.isEmpty(obj) || _.isEmpty(contextAction))
                return {};
            if (_.isArray(obj)) {
                return Extractor.extractArrayValues(contextAction, obj);
            }
            else {
                return Extractor.extractValues(contextAction, obj);
            }
        };
        Extractor.extractValues = function (contextAction, object) {
            var id = object && object['@id'];
            if (!id)
                return {};
            var result = {};
            var template = new UriTemplate(contextAction.template);
            var values = template.fromUri(id);
            if (_.isEmpty(values))
                return {};
            _.each(contextAction.mappings, function (mapping) {
                var value = values[mapping.variable];
                if (!value)
                    return;
                result[mapping.source] = value;
            });
            return result;
        };
        Extractor.extractArrayValues = function (contextAction, objects) {
            var values = _.map(objects, function (obj) {
                return Extractor.extractValues(contextAction, obj);
            });
            values = _.compact(values);
            var result = {};
            _.each(contextAction.mappings, function (mapping) {
                result[mapping.source] = [];
                _.each(values, function (attrs) {
                    if (!attrs[mapping.source])
                        return;
                    if (_.include(result[mapping.source], attrs[mapping.source]))
                        return;
                    result[mapping.source].push(attrs[mapping.source]);
                });
            });
            return result;
        };
        return Extractor;
    })();
    Chinchilla.Extractor = Extractor;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "../../typings/uriTemplate.d.ts" />
/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "config.ts" />
/// <reference path = "result.ts" />
/// <reference path = "context.ts" />
/// <reference path = "extractor.ts" />
var Chinchilla;
(function (Chinchilla) {
    var Action = (function () {
        function Action(contextAction, params, body, options) {
            var _this = this;
            if (params === void 0) { params = {}; }
            this.result = new Chinchilla.Result();
            this.contextAction = contextAction;
            this.uriTmpl = new UriTemplate(contextAction.template);
            this.params = Chinchilla.Extractor.uriParams(contextAction, params);
            this.options = options;
            // reformat body to match rails API
            this.body = this.formatBody(body);
            this.ready = new Promise(function (resolve, reject) {
                var uri = _this.uriTmpl.fillFromObject(_this.params);
                var req;
                switch (contextAction.method) {
                    case 'GET':
                        req = request.get(uri);
                        break;
                    case 'POST':
                        req = request.post(uri)
                            .send(_this.body);
                        break;
                    case 'PUT':
                        req = request.put(uri)
                            .send(_this.body);
                        break;
                    case 'PATCH':
                        req = request.patch(uri)
                            .send(_this.body);
                        break;
                    case 'DELETE':
                        req = request.del(uri);
                        break;
                }
                // add timestamp
                req = req.query({ t: Chinchilla.Config.timestamp });
                // add session by default
                if (!options || !(options.withoutSession === true)) {
                    req = req.set('Session-Id', Chinchilla.Config.getSessionId());
                }
                // add custom headers
                if (options && (options.header || options.headers)) {
                    var headers = options.headers || options.header;
                    if (typeof headers === 'string')
                        req.set(headers, 'true');
                    else if (typeof headers === 'object')
                        for (var key in headers)
                            req.set(key, headers[key]);
                }
                req.end(function (err, res) {
                    if (err) {
                        var error = new Chinchilla.ErrorResult(err.response ? err.response.text : 'No error details available.').error(res);
                        error.stack = err.stack;
                        if (Chinchilla.Config.errorInterceptor) {
                            // if error interceptor returns true, then abort (don't resolve nor reject)
                            if (Chinchilla.Config.errorInterceptor(error))
                                return;
                        }
                        return reject(error);
                    }
                    _this.result.success(res);
                    resolve(_this.result);
                });
            });
        }
        Action.prototype.formatBody = function (body) {
            var _this = this;
            if (_.isEmpty(body))
                return;
            var formatted = {};
            if (this.options && (this.options.raw === true)) {
                formatted = this.cleanupObject(body);
            }
            else if (_.isArray(body)) {
                _.each(body, function (obj) {
                    formatted[obj.id] = _this.remapAttributes(_this.cleanupObject(obj));
                });
            }
            else {
                formatted = this.remapAttributes(this.cleanupObject(body));
            }
            return formatted;
        };
        // cleans the object to be send
        // * rejects attributes starting with $
        // * rejects validation errors and isPristine attribute
        // * rejects js functions
        // * rejects empty objects {}
        // * rejects empty objects within array [{}]
        Action.prototype.cleanupObject = function (object) {
            var _this = this;
            if (_.isEmpty(object))
                return {};
            var cleaned = {};
            _.each(object, function (value, key) {
                if (/^\$/.test(key) || key === 'errors' || key === 'isPristine' || _.isFunction(value)) {
                }
                else if (_.isArray(value)) {
                    if (_.isPlainObject(value[0])) {
                        var subset = _.map(value, function (x) {
                            return _this.cleanupObject(x);
                        });
                        cleaned[key] = _.reject(subset, function (x) {
                            return _.isEmpty(x);
                        });
                    }
                    else {
                        cleaned[key] = value;
                    }
                }
                else if (_.isPlainObject(value)) {
                    var cleanedValue = _this.cleanupObject(value);
                    if (!_.isEmpty(cleanedValue))
                        cleaned[key] = cleanedValue;
                }
                else {
                    cleaned[key] = value;
                }
            });
            return cleaned;
        };
        Action.prototype.remapAttributes = function (object) {
            _.each(object, function (value, key) {
                // split csv string to array
                if (_.isString(value) && /(^tags|_ids$)/.test(key)) {
                    var values = _.select(value.split(','), function (item) {
                        return !_.isEmpty(item);
                    });
                    object[key] = values;
                }
                else if (_.isObject(value)) {
                    object[(key + "_attributes")] = value;
                    delete object[key];
                }
            });
            return object;
        };
        return Action;
    })();
    Chinchilla.Action = Action;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "subject.ts" />
/// <reference path = "action.ts" />
/// <reference path = "extractor.ts" />
/// <reference path = "context.ts" />
var Chinchilla;
(function (Chinchilla) {
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
            this.habtm = _.isArray(_.first(this.associationData));
            if (this.habtm)
                this.associationData = _.flatten(this.associationData);
            this.ready = this.subject.context.ready.then(function (context) {
                _this.associationProperty = context.association(name);
                return Chinchilla.Context.get(_this.associationProperty.type).ready.then(function (associationContext) {
                    _this.context = associationContext;
                    var contextAction = _this.associationData.length > 1 || _this.associationProperty.collection ?
                        associationContext.collectionAction('get') :
                        associationContext.memberAction('get');
                    if (!contextAction)
                        throw new Error("could not load association " + name);
                    //var extractedParams = Extractor.extractCollectionParams(this.subject.context, this.subject.objects);
                    //TODO is ^^ this needed?
                    return new Chinchilla.Action(contextAction, _this.associationParams, {}).ready.then(function (result) {
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
            if (this.associationProperty.collection && !this.cache[key]) {
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
                    _.each(result.objects, function (obj) {
                        sorted[obj['@id']] = obj;
                    });
                    _.each(this.subject.objects, function (obj) {
                        var key = obj['@id'];
                        _this.cache[key] = [];
                        var references = obj.$associations && obj.$associations[_this.name];
                        if (!_.isArray(references))
                            return true;
                        _.each(references, function (reference) {
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
                    associationName = _.findKey(this.context.properties, function (value, key) {
                        return value && value.type && value.type === _this.subject.context.id;
                    });
                    // 2. attempt: try to find association name using inverse_of if given
                    if (!associationName) {
                        associationName = _.findKey(this.context.properties, function (value, key) {
                            return value && value.inverse_of && value.inverse_of === _this.name;
                        });
                    }
                    _.each(result.objects, function (obj) {
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
                _.each(result.objects, function (obj) {
                    sorted[obj['@id']] = obj;
                });
                _.each(this.subject.objects, function (obj) {
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
                    return Chinchilla.Extractor.extractMemberParams(this.context, _.flatten(this.associationData));
                }
                else if (this.associationProperty.collection) {
                    return Chinchilla.Extractor.extractCollectionParams(this.context, this.associationData);
                }
                else {
                    return Chinchilla.Extractor.extractMemberParams(this.context, this.associationData);
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
            return _.map(this.subject.objects, function (obj) {
                return assocData(obj);
            });
        };
        // this is a cache for all Association instances
        Association.cache = {};
        return Association;
    })();
    Chinchilla.Association = Association;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "context.ts" />
/// <reference path = "config.ts" />
/// <reference path = "action.ts" />
/// <reference path = "extractor.ts" />
/// <reference path = "association.ts" />
var Chinchilla;
(function (Chinchilla) {
    var Subject = (function () {
        function Subject(objectsOrApp, model) {
            // unique id for this instance (for cache key purpose)
            this.id = Math.random().toString(36).substr(2, 9);
            // adds and initializes objects to this Subject
            if (_.isString(objectsOrApp)) {
                this.contextUrl = Chinchilla.Config.endpoints[objectsOrApp] + "/context/" + model;
            }
            else {
                _.isArray(objectsOrApp) ? this.addObjects(objectsOrApp) : this.addObject(objectsOrApp);
            }
        }
        Subject.detachFromSubject = function (objects) {
            var detach = function (object) {
                var copy = _.clone(object);
                delete copy['$subject'];
                return copy;
            };
            if (_.isArray(objects)) {
                return _.map(objects, detach);
            }
            else if (_.isPlainObject(objects)) {
                return detach(objects);
            }
            return objects;
        };
        Subject.prototype.memberAction = function (name, inputParams, options) {
            var _this = this;
            var promise;
            return promise = this.context.ready.then(function (context) {
                var contextAction = context.memberAction(name);
                var mergedParams = _.merge({}, _this.objectParams, inputParams);
                var action = new Chinchilla.Action(contextAction, mergedParams, _this.subject, options);
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
                var mergedParams = _.merge({}, _this.objectParams, inputParams);
                return new Chinchilla.Action(contextAction, mergedParams, _this.subject, options).ready;
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
            if (this.subject && _.isArray(this.subject)) {
                return this.collectionAction.apply(this, args);
            }
            else {
                return this.memberAction.apply(this, args);
            }
        };
        // returns Association that resolves to a Result where the objects might belong to different Subjects
        Subject.prototype.association = function (name) {
            return Chinchilla.Association.get(this, name);
        };
        // can be used to easily instantiate a new object with given context like this
        //
        // chch('um', 'user').new(first_name: 'Peter')
        Subject.prototype.new = function (attrs) {
            if (attrs === void 0) { attrs = {}; }
            this.subject = _.merge({ '@context': this.contextUrl, '$subject': this }, attrs);
            return this;
        };
        Object.defineProperty(Subject.prototype, "context", {
            get: function () {
                if (this._context)
                    return this._context;
                return this._context = Chinchilla.Context.get(this.contextUrl);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Subject.prototype, "objects", {
            get: function () {
                return _.isArray(this.subject) ? this.subject : [this.subject];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Subject.prototype, "object", {
            get: function () {
                return _.isArray(this.subject) ? _.first(this.subject) : this.subject;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Subject.prototype, "objectParams", {
            get: function () {
                return Chinchilla.Extractor.extractMemberParams(this.context, this.objects);
            },
            enumerable: true,
            configurable: true
        });
        Subject.prototype.addObjects = function (objects) {
            var _this = this;
            this.subject = [];
            _.each(objects, function (obj) {
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
                if (_.isArray(value)) {
                    var el = _.first(value);
                    if (_.isPlainObject(el) && el['@id']) {
                        // HABTM
                        object.$associations[key] = _.clone(value);
                        delete object[key];
                    }
                }
                else if (_.isPlainObject(value) && value['@id']) {
                    object.$associations[key] = _.clone(value);
                    delete object[key];
                }
            }
        };
        Subject.prototype.initAssociationGetters = function (object) {
            var _this = this;
            if (!object.$associations)
                return;
            _.each(object.$associations, function (value, key) {
                var promiseKey = key + "Promise";
                Object.defineProperty(object, key, {
                    get: function () {
                        return _this.association(key).getDataFor(object);
                    }
                });
                Object.defineProperty(object, key + "Promise", {
                    get: function () {
                        return _this.association(key).ready;
                    }
                });
            });
        };
        return Subject;
    })();
    Chinchilla.Subject = Subject;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "chinchilla/subject.ts" />
window['chch'] = function (objectsOrApp, model) {
    // detach from existing Subject first before creating a new one..
    objectsOrApp = Chinchilla.Subject.detachFromSubject(objectsOrApp);
    return new Chinchilla.Subject(objectsOrApp, model);
};
window['chch'].config = Chinchilla.Config;
window['chch'].new = function (app, model, attrs) {
    if (attrs === void 0) { attrs = {}; }
    return _.merge({ '@context': Chinchilla.Config.endpoints[app] + "/context/" + model }, attrs);
};
window['chch'].contextUrl = function (app, model) {
    return Chinchilla.Config.endpoints[app] + "/context/" + model;
};
window['chch'].context = function (urlOrApp, model) {
    if (!model) {
        // assume first param is the context url
        return Chinchilla.Context.get(urlOrApp).ready;
    }
    else {
        return Chinchilla.Context.get(Chinchilla.Config.endpoints[urlOrApp] + "/context/" + model).ready;
    }
};
