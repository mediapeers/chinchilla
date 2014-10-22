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
      'ChContextOp',
      function (ChContextOp) {
        return function (systemId) {
          var contextUrl;
          contextUrl = entryPoints[systemId];
          if (!contextUrl) {
            throw new Error('no entry point url defined for ' + systemId);
          }
          return new ChContextOp(null, { '@context': contextUrl });
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
  angular.module('chinchilla').factory('ChActionOp', [
    'ChOperation',
    'ChRequestBuilder',
    function (ChOperation, ChRequestBuilder) {
      var ChActionOp;
      return ChActionOp = function (_super) {
        __extends(ChActionOp, _super);
        function ChActionOp($parent, $type, $action, $params) {
          var error, success;
          this.$parent = $parent;
          this.$type = $type;
          this.$action = $action;
          this.$params = $params != null ? $params : {};
          ChOperation.init(this);
          this.$subject = null;
          this.$data = null;
          this.$arr = [];
          this.$obj = {};
          success = function (_this) {
            return function () {
              _this.$context = _this.$parent.$context;
              if (!_.isString(_this.$parent.$subject)) {
                _this.$subject = _this.$parent.$subject;
              }
              _this.$associationData = _this.$parent.$associationData;
              _this.$associationProperty = _this.$parent.$associationProperty;
              _this.$associationType = _this.$associationProperty && _this.$associationProperty.collection ? 'collection' : 'member';
              if (_.isNull(_this.$type) && _this.$associationType) {
                _this.$type = _this.$associationType;
              }
              return _this.__run__();
            };
          }(this);
          error = function (_this) {
            return function () {
              return _this.$deferred.reject();
            };
          }(this);
          this.$parent.$promise.then(success, error);
        }
        ChActionOp.prototype.__run__ = function () {
          var builder, error, success;
          builder = new ChRequestBuilder(this.$context, this.$subject, this.$type, this.$action);
          if (this.$type === 'collection' && _.isArray(this.$associationData) && _.isArray(_.first(this.$associationData))) {
            _.each(this.$associationData, function (data) {
              return builder.extractFrom(data, 'member');
            });
          } else if (this.$type === 'member' && _.isArray(this.$associationData)) {
            builder.extractFrom(this.$associationData, 'member');
          } else {
            builder.extractFrom(this.$associationData, this.$associationType);
          }
          builder.extractFrom(this.$subject, this.$type);
          builder.mergeParams(this.$params);
          success = function (_this) {
            return function (response) {
              _this.$data = response.data;
              if (response.data.members) {
                _this.$arr = response.data.members;
              } else {
                _this.$obj = response.data;
              }
              return _this.$deferred.resolve(_this);
            };
          }(this);
          error = function (_this) {
            return function () {
              return _this.$deferred.reject();
            };
          }(this);
          return builder.performRequest().then(success, error);
        };
        return ChActionOp;
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
        if (_.isPlainObject(assoc)) {
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
  angular.module('chinchilla').factory('ChContextOp', [
    'ChOperation',
    'ChContextService',
    function (ChOperation, ChContextService) {
      var ChContextOp;
      return ChContextOp = function (_super) {
        __extends(ChContextOp, _super);
        function ChContextOp($parent, $subject) {
          var error, success;
          this.$parent = $parent != null ? $parent : null;
          this.$subject = $subject;
          ChOperation.init(this);
          this.$associationProperty = null;
          this.$associationData = null;
          if (this.$parent) {
            success = function (_this) {
              return function () {
                var members;
                if (_.isString(_this.$subject)) {
                  _this.$associationProperty = _this.$parent.$context.association(_this.$subject);
                  _this.$associationData = null;
                  if (_this.$parent.$data && (members = _this.$parent.$data.members)) {
                    _this.$associationData = _.map(members, function (member) {
                      return member[_this.$subject];
                    });
                  } else {
                    _this.$associationData = _this.$parent.$data && _this.$parent.$data[_this.$subject];
                  }
                }
                return _this.__run__();
              };
            }(this);
            error = function (_this) {
              return function () {
                return _this.$deferred.reject();
              };
            }(this);
            this.$parent.$promise.then(success, error);
          } else {
            this.__run__();
          }
        }
        ChContextOp.prototype.__run__ = function () {
          var error, success;
          this.__findContextUrl__();
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
        ChContextOp.prototype.__findContextUrl__ = function () {
          this.$contextUrl = null;
          if (_.isString(this.$subject)) {
            this.$contextUrl = this.$associationProperty && this.$associationProperty.type;
            if (!this.$contextUrl) {
              throw new Error('ChContextOp#__findContextUrl__: no association \'' + this.$subject + '\' found');
            }
          } else if (_.isArray(this.$subject)) {
            this.$contextUrl = this.$subject[0] && this.$subject[0]['@context'];
            if (!first || !this.$contextUrl) {
              console.log(this);
              throw new Error('ChContextOp#__findContextUrl__: empty array of objects given or missing context');
            }
            if (_.any(this.$subject, function (current) {
                return current['@context'] !== this.$contextUrl;
              })) {
              console.log(this);
              throw new Error('ChContextOp#__findContextUrl__: objects with different contexts given, aborting');
            }
          } else if (_.isPlainObject(this.$subject)) {
            this.$contextUrl = this.$subject['@context'];
            if (!this.$contextUrl) {
              console.log(this);
              throw new Error('ChContextOp#__findContextUrl__: missing context');
            }
          } else {
            console.log(this);
            throw new Error('ChContextOp#__findContextUrl__: unsupported subject');
          }
        };
        return ChContextOp;
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
      var contexts;
      contexts = {};
      return {
        get: function (url) {
          var context, deferred, error, success;
          deferred = $q.defer();
          if (context = contexts[url]) {
            deferred.resolve(context);
          } else {
            success = function (response) {
              context = new ChContext(response.data);
              contexts[url] = context;
              return deferred.resolve(context);
            };
            error = function () {
              return deferred.reject();
            };
            $http.get(url).then(success, error);
          }
          return deferred.promise;
        }
      };
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
          instance.ChContextOp = $injector.get('ChContextOp');
          return instance.ChActionOp = $injector.get('ChActionOp');
        };
        ChOperation.prototype.$ = function (subject) {
          var contextOp;
          return contextOp = new this.ChContextOp(this, subject);
        };
        ChOperation.prototype.$$ = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new this.ChActionOp(this, null, action, params);
        };
        ChOperation.prototype.$c = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new this.ChActionOp(this, 'collection', action, params);
        };
        ChOperation.prototype.$m = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new this.ChActionOp(this, 'member', action, params);
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
    function ($q, $injector, $http) {
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
          var params;
          params = _.isArray(source) && type === 'member' ? this._extractMemberArray(source) : _.isArray(source) && type === 'collection' ? this._extractCollectionArray(source) : type === 'collection' ? this._extractCollection(source) : this._extractMember(source);
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
          var result;
          if (this.$type === 'collection') {
            result = {};
            _.each(this.$subject, function (obj) {
              return result[obj.id] = obj;
            });
            return result;
          } else {
            return this.$subject;
          }
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
          return this._extractArrayValues(action, source);
        };
        ChRequestBuilder.prototype._extractCollectionArray = function (source) {
          var action;
          if (_.isEmpty(source)) {
            return {};
          }
          action = this.$context.collection_action('query');
          return this._extractArrayValues(action, source);
        };
        ChRequestBuilder.prototype._extractCollection = function (source) {
          var action;
          action = this.$context.collection_action('query');
          return this._extractValues(action, source);
        };
        ChRequestBuilder.prototype._extractMember = function (source) {
          var action;
          action = this.$context.member_action('get');
          return this._extractValues(action, source);
        };
        ChRequestBuilder.prototype._extractArrayValues = function (action, objects) {
          var mappings, result, values;
          mappings = action.mappings;
          values = _.map(objects, function (_this) {
            return function (obj) {
              return _this._extractValues(action, obj);
            };
          }(this));
          values = _.compact(values);
          result = {};
          _.each(mappings, function (mapping) {
            result[mapping.source] = [];
            return _.each(values, function (attrs) {
              if (!attrs[mapping.source]) {
                return;
              }
              return result[mapping.source].push(attrs[mapping.source]);
            });
          });
          return result;
        };
        ChRequestBuilder.prototype._extractValues = function (action, object) {
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
        return ChRequestBuilder;
      }();
    }
  ]);
}.call(this));