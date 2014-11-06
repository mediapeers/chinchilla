(function () {
  var module;
  module = angular.module('chinchilla', []);
  module.provider('$ch', function () {
    var entryPoints;
    entryPoints = {};
    this.setEntryPoint = function (systemId, url) {
      return entryPoints[systemId] = url;
    };
    this.$get = [
      'ChContextOperation',
      function (ChContextOperation) {
        return function (subject) {
          var contextUrl;
          if (_.isString(subject)) {
            contextUrl = entryPoints[subject];
            if (!contextUrl) {
              throw new Error('no entry point url defined for ' + subject);
            }
            return new ChContextOperation(null, { '@context': contextUrl });
          } else {
            return new ChContextOperation(null, subject);
          }
        };
      }
    ];
    return this;
  });
}.call(this));
(function () {
  var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key))
          child[key] = parent[key];
      }
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };
  angular.module('chinchilla').factory('ChActionOperation', [
    '$q',
    'ChOperation',
    'ChRequestBuilder',
    'ChLazyLoader',
    function ($q, ChOperation, ChRequestBuilder, ChLazyLoader) {
      var ChActionOperation;
      return ChActionOperation = function (_super) {
        __extends(ChActionOperation, _super);
        function ChActionOperation($parent, $type, $action, $params) {
          var error, success;
          this.$parent = $parent;
          this.$type = $type;
          this.$action = $action;
          this.$params = $params != null ? $params : {};
          ChOperation.init(this);
          this.$subject = null;
          this.$arr = [];
          this.$obj = {};
          this.$headers = {};
          success = function (_this) {
            return function () {
              _this.$context = _this.$parent.$context;
              if (!_.isString(_this.$parent.$subject)) {
                _this.$subject = _this.$parent.$subject;
              }
              _this.$associationData = _this.$parent.$associationData;
              _this.$associationProperty = _this.$parent.$associationProperty;
              _this.$associationType = _this.$associationProperty && _this.$associationProperty.collection ? 'collection' : 'member';
              if (_.isNull(_this.$type)) {
                _this.$type = _.isArray(_this.$associationData) || _.isArray(_this.$parent.$subject) ? 'collection' : _.isPlainObject(_this.$associationType) ? 'member' : _this.$associationType;
              }
              return _this._run();
            };
          }(this);
          error = function (_this) {
            return function () {
              return _this.$deferred.reject(_this);
            };
          }(this);
          this.$parent.$promise.then(success, error);
        }
        ChActionOperation.prototype._run = function () {
          var builder, error, flattenedAssociationData, success;
          builder = new ChRequestBuilder(this.$context, this.$subject, this.$type, this.$action);
          if (this.$type === 'collection' && _.isArray(this.$associationData) && _.isArray(_.first(this.$associationData))) {
            flattenedAssociationData = _.flatten(this.$associationData);
            builder.extractFrom(flattenedAssociationData, 'member');
          } else if (this.$type === 'member' && _.isArray(this.$associationData)) {
            builder.extractFrom(this.$associationData, 'member');
          } else {
            builder.extractFrom(this.$associationData, this.$associationType);
          }
          builder.extractFrom(this.$subject, this.$type);
          builder.mergeParams(this.$params);
          success = function (_this) {
            return function (response) {
              var data;
              data = response.data && response.data.members || response.data;
              if (_.isArray(data)) {
                _.each(data, function (member) {
                  return _this.$arr.push(member);
                });
              } else {
                _.merge(_this.$obj, data);
              }
              _.merge(_this.$headers, response.headers());
              _this._moveAssociations();
              return _this._initLazyLoading();
            };
          }(this);
          error = function (_this) {
            return function (response) {
              _this.$error = response.data;
              _.merge(_this.$headers, response.headers());
              return _this.$deferred.reject(_this);
            };
          }(this);
          return builder.performRequest().then(success, error);
        };
        ChActionOperation.prototype._objects = function () {
          if (_.isEmpty(this.$obj)) {
            return this.$arr;
          } else {
            return [this.$obj];
          }
        };
        ChActionOperation.prototype._moveAssociations = function () {
          return _.each(this._objects(), function (object) {
            object.$associations || (object.$associations = {});
            return _.each(object, function (value, key) {
              if (key === '$associations') {
                return;
              }
              if (_.isArray(value) && _.isPlainObject(_.first(value)) || _.isPlainObject(value) && value['@id']) {
                object.$associations[key] = _.clone(value);
                return delete object[key];
              }
            });
          });
        };
        ChActionOperation.prototype._initLazyLoading = function () {
          var groups, promises, self;
          self = this;
          groups = _.groupBy(this._objects(), '@context');
          promises = [];
          _.each(groups, function (records, contextUrl) {
            var operation;
            operation = new self.ChObjectsOperation(records);
            operation.$promise.then(function () {
              return new ChLazyLoader(operation, records);
            });
            return promises.push(operation.$promise);
          });
          return $q.all(promises).then(function () {
            return self.$deferred.resolve(self);
          });
        };
        return ChActionOperation;
      }(ChOperation);
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ChContext', function () {
    var ChContext;
    return ChContext = function () {
      function ChContext(data) {
        this.data = data != null ? data : {};
      }
      ChContext.prototype.property = function (name) {
        var context;
        context = this.data && this.data['@context'];
        return context && context.properties && context.properties[name];
      };
      ChContext.prototype.association = function (name) {
        var assoc;
        assoc = this.property(name);
        if (_.isPlainObject(assoc) && assoc.type && assoc.type.match(/^(http|https)\:/)) {
          return assoc;
        }
      };
      ChContext.prototype.member_action = function (name) {
        var action, context;
        context = this.data && this.data['@context'];
        action = context && context.member_actions && context.member_actions[name];
        if (!action) {
          throw new Error('requested non-existing member action \'' + name + '\'');
        }
        return action;
      };
      ChContext.prototype.collection_action = function (name) {
        var action, context;
        context = this.data && this.data['@context'];
        action = context && context.collection_actions && context.collection_actions[name];
        if (!action) {
          throw new Error('requested non-existing collection action \'' + name + '\'');
        }
        return action;
      };
      return ChContext;
    }();
  });
}.call(this));
(function () {
  var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key))
          child[key] = parent[key];
      }
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };
  angular.module('chinchilla').factory('ChContextOperation', [
    '$q',
    'ChOperation',
    'ChContextService',
    function ($q, ChOperation, ChContextService) {
      var ChContextOperation;
      return ChContextOperation = function (_super) {
        __extends(ChContextOperation, _super);
        function ChContextOperation($parent, $subject) {
          var error, success;
          this.$parent = $parent != null ? $parent : null;
          this.$subject = $subject;
          ChOperation.init(this);
          this.$associationProperty = null;
          this.$associationData = null;
          if (this.$parent) {
            success = function (_this) {
              return function () {
                var assocData;
                if (_.isString(_this.$subject)) {
                  _this.$associationProperty = _this.$parent.$context.association(_this.$subject);
                  _this.$associationData = null;
                  assocData = function (object) {
                    return object && object.$associations && object.$associations[_this.$subject];
                  };
                  if (!_.isEmpty(_this.$parent.$arr)) {
                    _this.$associationData = _.map(_this.$parent.$arr, function (member) {
                      return assocData(member);
                    });
                  } else {
                    _this.$associationData = assocData(_this.$parent.$obj);
                  }
                }
                return _this._run();
              };
            }(this);
            error = function (_this) {
              return function () {
                return _this.$deferred.reject();
              };
            }(this);
            this.$parent.$promise.then(success, error);
          } else {
            this._run();
          }
        }
        ChContextOperation.prototype.$new = function (attrs) {
          var deferred, result;
          if (attrs == null) {
            attrs = {};
          }
          deferred = $q.defer();
          result = {
            $obj: _.extend({}, attrs),
            $deferred: deferred,
            $promise: deferred.promise
          };
          this.$promise.then(function (_this) {
            return function () {
              result.$obj['@context'] = _this.$contextUrl;
              return deferred.resolve(result);
            };
          }(this));
          return result;
        };
        ChContextOperation.prototype._run = function () {
          var error, success;
          this._findContextUrl(this.$subject);
          success = function (_this) {
            return function (context) {
              _this.$context = context;
              return _this.$deferred.resolve(_this);
            };
          }(this);
          error = function (_this) {
            return function () {
              return _this.$deferred.reject();
            };
          }(this);
          return ChContextService.get(this.$contextUrl).then(success, error);
        };
        return ChContextOperation;
      }(ChOperation);
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ChContextService', [
    '$q',
    '$http',
    'ChContext',
    function ($q, $http, ChContext) {
      var ChContextService;
      ChContextService = function () {
        function ChContextService() {
          this.contexts = {};
        }
        ChContextService.prototype.get = function (url) {
          var context, deferred, error, success;
          deferred = $q.defer();
          if (context = this.contexts[url]) {
            deferred.resolve(context);
          } else {
            success = function (_this) {
              return function (response) {
                context = new ChContext(response.data);
                _this.contexts[url] = context;
                return deferred.resolve(context);
              };
            }(this);
            error = function () {
              return deferred.reject();
            };
            $http.get(url).then(success, error);
          }
          return deferred.promise;
        };
        return ChContextService;
      }();
      return new ChContextService();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ChLazyAssociation', [
    '$injector',
    function ($injector) {
      var ChLazyAssociation;
      return ChLazyAssociation = function () {
        function ChLazyAssociation($operation, $objects, $name) {
          this.$operation = $operation;
          this.$objects = $objects;
          this.$name = $name;
          this.cache = {};
          this.isCollection = this.$operation.$context.association(this.$name).collection;
          this._initCache();
        }
        ChLazyAssociation.prototype.load = function () {
          this.contextOperation || (this.contextOperation = this.$operation.$(this.$name));
          return this.actionOperation || (this.actionOperation = this.contextOperation.$$('get').$promise.then(this._assign.bind(this)));
        };
        ChLazyAssociation.prototype.retrieve = function (object) {
          this.load();
          return this.cache[object['@id']];
        };
        ChLazyAssociation.prototype._initCache = function () {
          return _.each(this.$objects, function (_this) {
            return function (object) {
              return _this.cache[object['@id']] = _this.isCollection ? [] : {};
            };
          }(this));
        };
        ChLazyAssociation.prototype._assign = function (actionOp) {
          var associationName, habtm, parentContextId, results, sortedResults;
          results = _.isEmpty(actionOp.$obj) ? actionOp.$arr : [actionOp.$obj];
          if (this.isCollection) {
            habtm = _.any(this.$objects, function (_this) {
              return function (object) {
                var reference;
                reference = object.$associations && object.$associations[_this.$name];
                if (!reference) {
                  return;
                }
                return _.isArray(reference);
              };
            }(this));
            if (habtm) {
              sortedResults = {};
              _.each(results, function (result) {
                return sortedResults[result['@id']] = result;
              });
              return _.each(this.$objects, function (_this) {
                return function (object) {
                  var references;
                  references = object.$associations && object.$associations[_this.$name];
                  if (!_.isArray(references)) {
                    return;
                  }
                  return _.each(references, function (reference) {
                    var result;
                    result = sortedResults[reference['@id']];
                    if (!result) {
                      return;
                    }
                    return _this.cache[object['@id']].push(result);
                  });
                };
              }(this));
            } else {
              parentContextId = this.$operation.$context.data['@context']['@id'];
              associationName = _.findKey(this.contextOperation.$context.data['@context']['properties'], function (value, key) {
                return value && value.type && value.type === parentContextId;
              });
              return _.each(results, function (_this) {
                return function (result) {
                  var backReference;
                  backReference = result && result.$associations && result.$associations[associationName] && result.$associations[associationName]['@id'];
                  if (!backReference) {
                    return;
                  }
                  return _this.cache[backReference].push(result);
                };
              }(this));
            }
          } else {
            sortedResults = {};
            _.each(results, function (result) {
              return sortedResults[result['@id']] = result;
            });
            return _.each(this.$objects, function (_this) {
              return function (object) {
                var requestedId, result;
                requestedId = object.$associations && object.$associations[_this.$name] && object.$associations[_this.$name]['@id'];
                if (!requestedId) {
                  return;
                }
                result = sortedResults[requestedId];
                if (!result) {
                  return;
                }
                return _.merge(_this.cache[object['@id']], result);
              };
            }(this));
          }
        };
        return ChLazyAssociation;
      }();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ChLazyLoader', [
    'ChLazyAssociation',
    function (ChLazyAssociation) {
      var ChLazyLoader;
      return ChLazyLoader = function () {
        function ChLazyLoader($operation, $objects) {
          this.$operation = $operation;
          this.$objects = $objects != null ? $objects : [];
          this.$cache = {};
          this._turnLazy();
        }
        ChLazyLoader.prototype._turnLazy = function () {
          var self;
          self = this;
          return _.each(this.$objects, function (object) {
            if (!object.$associations) {
              return;
            }
            return _.each(object.$associations, function (value, key) {
              return Object.defineProperty(object, key, {
                get: function () {
                  return self._association(key).retrieve(object);
                }
              });
            });
          });
        };
        ChLazyLoader.prototype._association = function (name) {
          var _base;
          return (_base = this.$cache)[name] || (_base[name] = new ChLazyAssociation(this.$operation, this.$objects, name));
        };
        return ChLazyLoader;
      }();
    }
  ]);
}.call(this));
(function () {
  var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key))
          child[key] = parent[key];
      }
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };
  angular.module('chinchilla').factory('ChObjectsOperation', [
    'ChOperation',
    'ChContextService',
    function (ChOperation, ChContextService) {
      var ChObjectsOperation;
      return ChObjectsOperation = function (_super) {
        __extends(ChObjectsOperation, _super);
        function ChObjectsOperation($objects) {
          this.$objects = $objects;
          ChOperation.init(this);
          this.$arr = [];
          this.$obj = {};
          this.$headers = {};
          this.$contextUrl = null;
          if (_.isArray(this.$objects)) {
            this.$arr = this.$objects;
          } else {
            this.$obj = this.$objects;
          }
          this._run();
        }
        ChObjectsOperation.prototype._run = function () {
          var error, success;
          this._findContextUrl(this.$objects);
          success = function (_this) {
            return function (context) {
              _this.$context = context;
              return _this.$deferred.resolve(_this);
            };
          }(this);
          error = function (_this) {
            return function () {
              return _this.$deferred.reject();
            };
          }(this);
          return ChContextService.get(this.$contextUrl).then(success, error);
        };
        return ChObjectsOperation;
      }(ChOperation);
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ChOperation', [
    '$q',
    '$injector',
    function ($q, $injector) {
      var ChOperation;
      return ChOperation = function () {
        function ChOperation() {
        }
        ChOperation.init = function (instance) {
          instance.$context = null;
          instance.$error = {};
          instance.$deferred = $q.defer();
          instance.$promise = instance.$deferred.promise;
          instance.ChContextOperation = $injector.get('ChContextOperation');
          instance.ChActionOperation = $injector.get('ChActionOperation');
          return instance.ChObjectsOperation = $injector.get('ChObjectsOperation');
        };
        ChOperation.prototype.$ = function (subject) {
          var contextOp;
          return contextOp = new this.ChContextOperation(this, subject);
        };
        ChOperation.prototype.$$ = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new this.ChActionOperation(this, null, action, params);
        };
        ChOperation.prototype.$c = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new this.ChActionOperation(this, 'collection', action, params);
        };
        ChOperation.prototype.$m = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new this.ChActionOperation(this, 'member', action, params);
        };
        ChOperation.prototype._findContextUrl = function (subject) {
          var first;
          this.$contextUrl = null;
          if (_.isString(subject)) {
            this.$contextUrl = this.$associationProperty && this.$associationProperty.type;
            if (!this.$contextUrl) {
              throw new Error('ChContextOperation#_findContextUrl: no association \'' + subject + '\' found');
            }
          } else if (_.isArray(subject)) {
            first = _.first(subject);
            this.$contextUrl = first && first['@context'];
            if (!first || !this.$contextUrl) {
              console.log(this);
              throw new Error('ChContextOperation#_findContextUrl: empty array of objects given or missing context');
            }
          } else if (_.isPlainObject(subject)) {
            this.$contextUrl = subject['@context'];
            if (!this.$contextUrl) {
              console.log(this);
              throw new Error('ChContextOperation#_findContextUrl: missing context');
            }
          } else {
            console.log(this);
            throw new Error('ChContextOperation#_findContextUrl: unsupported subject');
          }
        };
        return ChOperation;
      }();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ChRequestBuilder', [
    '$q',
    '$injector',
    '$http',
    'ChUtils',
    function ($q, $injector, $http, ChUtils) {
      var ChRequestBuilder;
      return ChRequestBuilder = function () {
        function ChRequestBuilder($context, $subject, $type, $action) {
          this.$context = $context;
          this.$subject = $subject;
          this.$type = $type;
          this.$action = $action;
          this.$mergedParams = {};
        }
        ChRequestBuilder.prototype.extractFrom = function (source, type) {
          var first, params;
          params = _.isArray(source) && type === 'member' ? this._extractMemberArray(source) : _.isArray(source) && type === 'collection' ? (first = _.first(source), _.has(first, '@context') ? this._extractMemberArray(source) : this._extractCollectionArray(source)) : type === 'collection' ? this._extractCollection(source) : this._extractMember(source);
          this.mergeParams(params);
          return params;
        };
        ChRequestBuilder.prototype.mergeParams = function (params) {
          return _.merge(this.$mergedParams, params || {});
        };
        ChRequestBuilder.prototype.performRequest = function () {
          var action, data;
          action = this.$type === 'collection' ? this.$context.collection_action(this.$action) : this.$context.member_action(this.$action);
          data = _.include([
            'POST',
            'PUT',
            'PATCH'
          ], action.method) ? this.data() : null;
          return $http({
            method: action.method,
            url: this.buildUrl(action),
            data: data
          });
        };
        ChRequestBuilder.prototype.buildUrl = function (action) {
          var uriTmpl;
          uriTmpl = new UriTemplate(action.template);
          return uriTmpl.fillFromObject(this._buildParams(action));
        };
        ChRequestBuilder.prototype.data = function () {
          var result, subject;
          subject = _.cloneDeep(this.$subject);
          if (_.isArray(subject)) {
            result = {};
            _.each(subject, function (_this) {
              return function (obj) {
                return result[obj.id] = _this._remapAttributes(obj);
              };
            }(this));
            return result;
          } else {
            return this._remapAttributes(subject);
          }
        };
        ChRequestBuilder.prototype._remapAttributes = function (object) {
          return _.each(object, function (value, key) {
            var values;
            if (_.isString(value) && /(^tags|_ids$)/.test(key)) {
              values = _.select(value.split(','), function (item) {
                return !_.isEmpty(item);
              });
              return object[key] = values;
            } else if (_.isObject(value) && !value.keepAsIs) {
              object['' + key + '_attributes'] = value;
              return delete object[key];
            }
          });
        };
        ChRequestBuilder.prototype._buildParams = function (action) {
          var mappings, result;
          mappings = action.mappings;
          result = {};
          _.each(mappings, function (_this) {
            return function (mapping) {
              var value;
              value = _this.$mergedParams[mapping.source] || _this.$mergedParams[mapping.variable];
              if (!value) {
                return;
              }
              return result[mapping.variable] = value;
            };
          }(this));
          return result;
        };
        ChRequestBuilder.prototype._extractMemberArray = function (source) {
          var action;
          if (_.isEmpty(source)) {
            return {};
          }
          action = this.$context.member_action('get');
          return ChUtils.extractArrayValues(action, source);
        };
        ChRequestBuilder.prototype._extractCollectionArray = function (source) {
          var action;
          if (_.isEmpty(source)) {
            return {};
          }
          action = this.$context.collection_action('query');
          return ChUtils.extractArrayValues(action, source);
        };
        ChRequestBuilder.prototype._extractCollection = function (source) {
          var action;
          action = this.$context.collection_action('query');
          return ChUtils.extractValues(action, source);
        };
        ChRequestBuilder.prototype._extractMember = function (source) {
          var action;
          action = this.$context.member_action('get');
          return ChUtils.extractValues(action, source);
        };
        return ChRequestBuilder;
      }();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ChUtils', function () {
    var ChUtils;
    return ChUtils = function () {
      function ChUtils() {
      }
      ChUtils.extractValues = function (action, object) {
        var id, mappings, result, template, values;
        id = object && object['@id'];
        if (!id) {
          return {};
        }
        result = {};
        template = new UriTemplate(action.template);
        values = template.fromUri(id);
        if (_.isEmpty(values)) {
          return {};
        }
        mappings = action.mappings;
        _.each(mappings, function (mapping) {
          var value;
          value = values[mapping.variable];
          if (!value) {
            return;
          }
          return result[mapping.source] = value;
        });
        return result;
      };
      ChUtils.extractArrayValues = function (action, objects) {
        var mappings, result, values;
        mappings = action.mappings;
        values = _.map(objects, function (obj) {
          return ChUtils.extractValues(action, obj);
        });
        values = _.compact(values);
        result = {};
        _.each(mappings, function (mapping) {
          result[mapping.source] = [];
          return _.each(values, function (attrs) {
            if (!attrs[mapping.source]) {
              return;
            }
            if (_.include(result[mapping.source], attrs[mapping.source])) {
              return;
            }
            return result[mapping.source].push(attrs[mapping.source]);
          });
        });
        return result;
      };
      return ChUtils;
    }();
  });
}.call(this));