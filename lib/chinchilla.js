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
          return new ChContextOp(null, { __context__: contextUrl });
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
    function (ChOperation) {
      var ChActionOp;
      return ChActionOp = function (_super) {
        __extends(ChActionOp, _super);
        function ChActionOp($parent, $type, $subject, $params) {
          var error, success;
          this.$parent = $parent;
          this.$type = $type;
          this.$subject = $subject;
          this.$params = $params != null ? $params : {};
          ChActionOp.__super__.constructor.apply(this, arguments);
          this.$data = null;
          this.$arr = [];
          this.$obj = {};
          if (this.$parent) {
            success = function (_this) {
              return function () {
                var association;
                _this.$context = _this.$parent.$context;
                if (_.isNull(_this.$type) && (association = _this.$parent.$association)) {
                  _this.$type = association.collection ? 'collection' : 'member';
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
        }
        ChActionOp.prototype.__run__ = function () {
          return this.$deferred.resolve({});
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
    }, __modulo = function (a, b) {
      return (a % b + +b) % b;
    };
  angular.module('chinchilla').factory('ChContextOp', [
    'ChOperation',
    'ChActionOp',
    'ChContextService',
    function (ChOperation, ChActionOp, ChContextService) {
      var ChContextOp;
      return ChContextOp = function (_super) {
        __extends(ChContextOp, _super);
        function ChContextOp($parent, $subject) {
          var error, success;
          this.$parent = $parent != null ? $parent : null;
          this.$subject = $subject;
          ChContextOp.__super__.constructor.apply(this, arguments);
          this.$association = null;
          if (this.$parent) {
            success = function (_this) {
              return function () {
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
        ChContextOp.prototype.$ = function (subject) {
          return new ChContextOp(this, subject);
        };
        ChContextOp.prototype.$$ = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new ChActionOp(this, null, action, params);
        };
        ChContextOp.prototype.$c = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new ChActionOp(this, 'collection', action, params);
        };
        ChContextOp.prototype.$m = function (action, params) {
          if (params == null) {
            params = {};
          }
          return new ChActionOp(this, 'member', action, params);
        };
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
            try {
              this.$association = this.$parent.$context.association(this.$subject);
              return this.$contextUrl = this.$association.type;
            } catch (_error) {
              console.log(this);
              throw new Error('ChContextOp#__findContextUrl__: no association \'' + this.$subject + '\' found');
            }
          } else if (_.isArray(this.$subject)) {
            this.$contextUrl = __modulo(this.$subject[0], this.$subject[0].__context__);
            if (!first || !this.$contextUrl) {
              console.log(this);
              throw new Error('ChContextOp#__findContextUrl__: empty array of objects given or missing context');
            }
            if (_.any(this.$subject, function (current) {
                return current.__context__ !== this.$contextUrl;
              })) {
              console.log(this);
              throw new Error('ChContextOp#__findContextUrl__: objects with different contexts given, aborting');
            }
          } else if (_.isPlainObject(this.$subject)) {
            this.$contextUrl = this.$subject.__context__;
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
    function ($q) {
      var ChOperation;
      return ChOperation = function () {
        function ChOperation() {
          this.$context = null;
          this.$error = {};
          this.$deferred = $q.defer();
          this.$promise = this.$deferred.promise;
        }
        return ChOperation;
      }();
    }
  ]);
}.call(this));