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
          ChActionOp.__super__.constructor.apply(this, arguments);
          this.$subject = null;
          this.$data = null;
          this.$arr = [];
          this.$obj = {};
          if (this.$parent) {
            success = function (_this) {
              return function () {
                var association;
                _this.$context = _this.$parent.$context;
                if (!_.isString(_this.$parent.$subject)) {
                  _this.$subject = _this.$parent.$subject;
                }
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
          var builder;
          builder = ChRequestBuilder.init(this.$context, this.$subject, this.$type, this.$action, this.$params);
          return builder.performRequest().then(function (_this) {
            return function (response) {
              _this.$data = response.data;
              return _this.$deferred.resolve(_this);
            };
          }(this));
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
            this.$contextUrl = __modulo(this.$subject[0], this.$subject[0]['@context']);
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
  angular.module('chinchilla').factory('ChRequestBuilder', [
    '$q',
    '$injector',
    '$http',
    function ($q, $injector, $http) {
      var ChRequestBuilder;
      return ChRequestBuilder = function () {
        ChRequestBuilder.init = function (context, subject, type, action) {
          var klass;
          klass = function () {
            switch (type) {
            case 'member':
              return $injector.get('ChMemberRequestBuilder');
            case 'collection':
              return $injector.get('ChCollectionRequestBuilder');
            }
          }();
          return new klass(context, subject, type, action);
        };
        function ChRequestBuilder($context, $subject, $type, $action, $params) {
          this.$context = $context;
          this.$subject = $subject;
          this.$type = $type;
          this.$action = $action;
          this.$params = $params;
        }
        ChRequestBuilder.prototype.extractAttributes = function () {
          throw new Error('ChRequestBuilder#extractAttributes: abstract! should be implemented in concrete class');
        };
        ChRequestBuilder.prototype.mappings = function () {
          throw new Error('ChRequestBuilder#mappings: abstract! should be implemented in concrete class');
        };
        ChRequestBuilder.prototype.buildUriParams = function () {
          throw new Error('ChRequestBuilder#buildUriParams: abstract! should be implemented in concrete class');
        };
        ChRequestBuilder.prototype.data = function () {
          throw new Error('ChRequestBuilder#data: abstract! should be implemented in concrete class');
        };
        ChRequestBuilder.prototype.performRequest = function () {
          var data;
          data = _.include([
            'POST',
            'PUT',
            'PATCH'
          ], this.$contextAction.method) ? this.data() : null;
          return $http({
            method: this.$contextAction.method,
            url: this.buildUrl(),
            params: this.$params,
            data: data
          });
        };
        ChRequestBuilder.prototype.buildUrl = function () {
          var uriTmpl;
          uriTmpl = new UriTemplate(this.$contextAction.template);
          return uriTmpl.fillFromObject(this.buildUriParams());
        };
        ChRequestBuilder.prototype.getId = function (obj) {
          var get, params, template;
          if (obj && obj['@id']) {
            return obj['@id'];
          }
          get = this.$context.member_action('get');
          template = new UriTemplate(get.template);
          params = {};
          _.each(get.mappings, function (mapping) {
            var value;
            value = obj[mapping.source];
            if (!value) {
              return;
            }
            return params[mapping.variable] = value;
          });
          return template.fillFromObject(params);
        };
        return ChRequestBuilder;
      }();
    }
  ]);
  angular.module('chinchilla').factory('ChMemberRequestBuilder', [
    '$q',
    'ChRequestBuilder',
    function ($q, ChRequestBuilder) {
      var ChMemberRequestBuilder;
      return ChMemberRequestBuilder = function (_super) {
        __extends(ChMemberRequestBuilder, _super);
        function ChMemberRequestBuilder() {
          ChMemberRequestBuilder.__super__.constructor.apply(this, arguments);
          this.$contextAction = this.$context.member_action(this.$action);
        }
        ChMemberRequestBuilder.prototype.extractAttributes = function () {
          var get, mappings, result, template, uriAttrs;
          if (!this.$subject) {
            return {};
          }
          get = this.$context.member_action('get');
          template = new UriTemplate(get.template);
          mappings = get.mappings;
          uriAttrs = template.fromUri(this.getId(this.$subject));
          result = {};
          _.each(mappings, function (mapping) {
            var value;
            value = uriAttrs[mapping.variable];
            if (!value) {
              return;
            }
            return result[mapping.source] = value;
          });
          return result;
        };
        ChMemberRequestBuilder.prototype.buildUriParams = function () {
          var attrs, params;
          params = {};
          attrs = this.extractAttributes();
          _.each(this.$contextAction.mappings, function (_this) {
            return function (mapping) {
              var value;
              value = attrs[mapping.source] || _this.$subject && _this.$subject[mapping.source];
              if (!value) {
                return;
              }
              return params[mapping.variable] = value;
            };
          }(this));
          return params;
        };
        ChMemberRequestBuilder.prototype.data = function () {
          return this.$subject || {};
        };
        return ChMemberRequestBuilder;
      }(ChRequestBuilder);
    }
  ]);
  angular.module('chinchilla').factory('ChCollectionRequestBuilder', [
    '$q',
    'ChRequestBuilder',
    function ($q, ChRequestBuilder) {
      var ChCollectionRequestBuilder;
      return ChCollectionRequestBuilder = function (_super) {
        __extends(ChCollectionRequestBuilder, _super);
        function ChCollectionRequestBuilder() {
          ChCollectionRequestBuilder.__super__.constructor.apply(this, arguments);
          this.$contextAction = this.$context.collection_action(this.$action);
        }
        ChCollectionRequestBuilder.prototype.extractAttributes = function () {
          var get, mappings, result, template, uriAttrs;
          if (_.isEmpty(this.$subject)) {
            return {};
          }
          get = this.$context.member_action('get');
          template = new UriTemplate(get.template);
          mappings = get.mappings;
          uriAttrs = _.map(this.$subject, function (_this) {
            return function (obj) {
              return template.fromUri(_this.getId(obj));
            };
          }(this));
          result = {};
          _.each(mappings, function (mapping) {
            var _name;
            result[_name = mapping.source] || (result[_name] = []);
            _.each(uriAttrs, function (attrs) {
              var value;
              value = attrs[mapping.variable];
              if (!value) {
                return;
              }
              return result[mapping.source].push(value);
            });
            return result[mapping.source] = result[mapping.source];
          });
          return result;
        };
        ChCollectionRequestBuilder.prototype.buildUriParams = function () {
          var attrs, params;
          params = {};
          attrs = this.extractAttributes();
          _.each(this.$contextAction.mappings, function (_this) {
            return function (mapping) {
              var _name;
              if (!_this.$subject) {
                return;
              }
              if (attrs[mapping.source]) {
                return params[mapping.variable] = attrs[mapping.source];
              } else {
                params[_name = mapping.variable] || (params[_name] = []);
                return _.each(_this.$subject, function (obj) {
                  var value;
                  value = obj[mapping.source];
                  if (!value) {
                    return;
                  }
                  return params[mapping.variable].push(value);
                });
              }
            };
          }(this));
          return params;
        };
        ChCollectionRequestBuilder.prototype.data = function () {
          var result;
          result = {};
          _.each(this.$subject, function (obj) {
            return result[obj.id] = obj;
          });
          return result;
        };
        return ChCollectionRequestBuilder;
      }(ChRequestBuilder);
    }
  ]);
}.call(this));