/// <reference path = "operation.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Chinchilla;
(function (Chinchilla) {
    var ContextOperation = (function (_super) {
        __extends(ContextOperation, _super);
        function ContextOperation(parent, subject) {
            if (parent === void 0) { parent = null; }
            this.parent = parent;
            this.subject = subject;
            _super.call(this);
        }
        return ContextOperation;
    })(Chinchilla.Operation);
    Chinchilla.ContextOperation = ContextOperation;
})(Chinchilla || (Chinchilla = {}));
var Chinchilla;
(function (Chinchilla) {
    var Context = (function () {
        function Context() {
        }
        return Context;
    })();
    Chinchilla.Context = Context;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "action_operation.ts" />
/// <reference path = "context_operation.ts" />
/// <reference path = "context.ts" />
var Chinchilla;
(function (Chinchilla) {
    var Operation = (function () {
        function Operation() {
            this.$error = {};
            this.$deferred = Promise.pending();
            this.$promise = this.$deferred.promise;
        }
        Operation.prototype.$ = function (subject) {
            new Chinchilla.ContextOperation(this, subject);
        };
        Operation.prototype.$$ = function (action, params, options) {
            if (params === void 0) { params = {}; }
            if (options === void 0) { options = {}; }
            new Chinchilla.ActionOperation(this, null, action, params, options);
        };
        Operation.prototype.$c = function (action, params, options) {
            if (params === void 0) { params = {}; }
            if (options === void 0) { options = {}; }
            new Chinchilla.ActionOperation(this, 'collection', action, params, options);
        };
        Operation.prototype.$m = function (action, params, options) {
            if (params === void 0) { params = {}; }
            if (options === void 0) { options = {}; }
            new Chinchilla.ActionOperation(this, 'member', action, params, options);
        };
        Operation.prototype._findContextUrl = function (subject) {
            if (_.isString(subject)) {
                this.$contextUrl = this.$associationProperty && this.$associationProperty.type;
                if (!this.$contextUrl)
                    throw new Error("Chinchilla.Operation#_findContextUrl: no association '" + subject + "' found");
            }
            else if (_.isArray(subject)) {
                var first = _.first(subject);
                this.$contextUrl = first && first['@context'];
                if (!this.$contextUrl)
                    throw new Error('Chinchilla.Operation#_findContextUrl: empty array of objects given or missing context');
            }
            else if (_.isPlainObject(subject)) {
                this.$contextUrl = subject['@context'];
                if (!this.$contextUrl)
                    throw new Error('Chinchilla.Operation#_findContextUrl: missing context');
            }
            else {
                throw new Error('Chinchilla.Operation#_findContextUrl: unsupported subject');
            }
        };
        return Operation;
    })();
    Chinchilla.Operation = Operation;
})(Chinchilla || (Chinchilla = {}));
var Chinchilla;
(function (Chinchilla) {
    var Session = (function () {
        function Session() {
            if (Session._instance)
                throw new Error('Error: Instantiation failed. Use Session.getInstance() instead');
            Session._instance = this;
        }
        Session.getInstance = function () {
            return Session._instance;
        };
        Session.prototype.getSessionId = function () {
            // TODO: implement
            return 'foo';
        };
        Session._instance = new Session();
        return Session;
    })();
    Chinchilla.Session = Session;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "context.ts" />
var Chinchilla;
(function (Chinchilla) {
    var RequestBuilder = (function () {
        function RequestBuilder(context, subject, type, actionName, options) {
            if (options === void 0) { options = {}; }
            this.$context = context;
            this.$subject = subject;
            this.$type = type;
            this.$actionName = actionName;
            this.$options = options;
        }
        return RequestBuilder;
    })();
    Chinchilla.RequestBuilder = RequestBuilder;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "operation.ts" />
/// <reference path = "session.ts" />
/// <reference path = "request_builder.ts" />
var Chinchilla;
(function (Chinchilla) {
    var ActionOperation = (function (_super) {
        __extends(ActionOperation, _super);
        function ActionOperation(parent, type, action, params, options) {
            var _this = this;
            if (params === void 0) { params = {}; }
            if (options === void 0) { options = {}; }
            _super.call(this);
            this.$parent = parent;
            this.$type = type;
            this.$action = action;
            this.$params = params;
            this.$options = options;
            if (!this.$options.withoutSession) {
                this.$options.http = {
                    'headers': {
                        'Session-Id': Chinchilla.Session.getInstance().getSessionId()
                    }
                };
            }
            this.$parent.$promise
                .then(function () {
                _this.$context = _this.$parent.$context;
                _this.$associationData = _this.$parent.$associationData;
                _this.$associationProperty = _this.$parent.$associationProperty;
                _this.$associationType = (_this.$associationProperty && _this.$associationProperty.collection) ? 'collection' : 'member';
                if (_.isNull(_this.$type)) {
                    // if type is not specified, try to guess from association
                    if (_.isArray(_this.$associationData) || _.isArray(_this.$parent.$subject)) {
                        _this.$type = 'collection';
                    }
                    else if (_.isPlainObject(_this.$associationType)) {
                        _this.$type = 'member';
                    }
                    else {
                        _this.$type = _this.$associationType;
                    }
                }
                _this._run();
            })
                .catch(function () {
                _this.$deferred.reject();
            });
        }
        ActionOperation.prototype.$objects = function () {
            return _.isEmpty(this.$obj) ? this.$arr : [this.$obj];
        };
        ActionOperation.prototype._run = function () {
            var _this = this;
            var builder = new Chinchilla.RequestBuilder(this.$context, this.$subject, this.$type, this.$action, this.$options);
            // DISASSEMBLE params from association references if available..
            // if collection association and data array of arrays => HABTM!
            if (this.$type === 'collection' && _.isArray(this.$associationData) && _.isArray(_.first(this.$associationData))) {
                var flattenedAssociationData = _.flatten(this.$associationData);
                builder.extractFrom(flattenedAssociationData, 'member');
            }
            else if (this.$type === 'member' && _.isArray(this.$associationData)) {
                builder.extractFrom(this.$associationData, 'member');
            }
            else {
                builder.extractFrom(this.$associationData, this.$associationType);
            }
            // DISASSEMBLE params from passed objects
            builder.extractFrom(this.$subject, this.$type);
            // add passed params
            builder.mergeParams(this.$params);
            builder.performRequest
                .then(function (response) {
                _.merge(_this.$headers, response.headers());
                if (response.data['@type'] === 'graph') {
                    _.each(response.data['@graph'], function (member) {
                        _this.$arr.push(member);
                    });
                }
                else {
                    var data = (response.data && response.data.members) || response.data;
                    if (_.isArray(data)) {
                        _.each(data, function (member) {
                            _this.$arr.push(member);
                        });
                    }
                    else {
                        _.merge(_this.$obj, data);
                    }
                    _this._moveAssociations();
                    _this._initLazyLoading();
                }
            })
                .catch(function (response) {
                _this.$response = response;
                _this.$error = response.data;
                _.merge(_this.$headers, response.headers());
                _this.$deferred.reject(_this);
            });
        };
        ActionOperation.prototype._moveAssociations = function () {
            _.each(this.$objects(), function (object) {
                object.$associations = object.$associations || {};
                _.each(object, function (key, value) {
                    if (key === '$associations')
                        return;
                    if ((_.isArray(value) && _.isPlainObject(_.first(value))) || (_.isPlainObject(value) && value['@id'])) {
                        object.$associations[key] = _.clone(value);
                        delete object[key];
                    }
                });
            });
        };
        ActionOperation.prototype._initLazyLoading = function () {
            var _this = this;
            var groups = _.groupBy(this.$objects(), '@context');
            var promises = [];
            _.each(groups, function (records, contextUrl) {
                var operation = new ObjectsOperation(records);
                operation.$promise.then(function () {
                    new LazyLoader(operation, records);
                });
                promises.push(operation.$promise);
            });
            Promise.all(promises).then(function () {
                _this.$deferred.resolve(_this);
            });
        };
        ActionOperation.prototype._buildGraph = function () {
            var _this = this;
            if (_.isEmpty(this.$arr))
                return;
            this.$graph = [];
            // id, parent_id tree builder
            _.each(this.$arr, function (node) {
                if (node.parent_id) {
                    var parent = _.find(_this.$arr, function (x) { x.id === node.parent_id; });
                    if (parent) {
                        node.parent = parent;
                        parent.children = parent.children || [];
                        parent.children.push(node);
                    }
                    else {
                        _this.$graph.push(node);
                    }
                }
            });
            this.$deferred.resolve(this);
        };
        return ActionOperation;
    })(Chinchilla.Operation);
    Chinchilla.ActionOperation = ActionOperation;
})(Chinchilla || (Chinchilla = {}));
/// <reference path = "chinchilla/action_operation.ts" />
/// <reference path = "chinchilla/context.ts" />
/// <reference path = "chinchilla/context_operation.ts" />
/// <reference path = "chinchilla/operation.ts" />
/// <reference path = "chinchilla/session.ts" />
