(function () {
  var module;
  module = angular.module('chinchilla', []);
  module.provider('$ch', function () {
    var provider;
    provider = this;
    this.defaults = {};
    this.endpoints = {};
    this.setEndpoint = function (moduleName, url) {
      console.log('Setting endpoint');
      return provider.endpoints[moduleName] = url;
    };
    this.$get = [
      'ch_Chinchilla',
      function (ch_Chinchilla, ch_EntryPointRegistry, ch_ContextRegistry) {
        provider.contextEntryPointRegistry = new ch_EntryPointRegistry(provider.endpoints);
        provider.contextRegistry = new ch_ContextRegistry();
        return function (definition) {
          return new ch_Chinchilla(definition, provider);
        };
      }
    ];
    return provider;
  });
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_Chinchilla', function () {
    var ArrayDefinition, Chinchilla, Definition, ObjectDefinition, StringDefinition, UriDefinition;
    Function.prototype.getter = function (prop, get) {
      return Object.defineProperty(this.prototype, prop, {
        get: get,
        configurable: true
      });
    };
    Definition = function () {
      function Definition() {
      }
      return Definition;
    }();
    StringDefinition = function () {
      function StringDefinition(definition) {
      }
      StringDefinition.prototype.type = function () {
      };
      StringDefinition.prototype.apiMethods = function () {
      };
      return StringDefinition;
    }();
    UriDefinition = function () {
      function UriDefinition(definition) {
      }
      UriDefinition.prototype.type = function () {
      };
      UriDefinition.prototype.apiMethods = function () {
      };
      return UriDefinition;
    }();
    ObjectDefinition = function () {
      function ObjectDefinition(definition) {
      }
      ObjectDefinition.prototype.type = function () {
      };
      ObjectDefinition.prototype.apiMethods = function () {
      };
      return ObjectDefinition;
    }();
    ArrayDefinition = function () {
      function ArrayDefinition(definition) {
      }
      ArrayDefinition.prototype.type = function () {
      };
      ArrayDefinition.prototype.apiMethods = function () {
      };
      return ArrayDefinition;
    }();
    Definition.prototype.build = function (definition) {
      if (_.isString(definition)) {
        if (definition.match(/https?\:\/\//)) {
          return new UriDefinition(definition);
        } else {
          return new StringDefinition(definition);
        }
      } else if (_.isObject(definition)) {
        if (_.isArray(definition)) {
          return new ArrayDefinition(definition);
        } else {
          return new ObjectDefinition(definition);
        }
      }
    };
    return Chinchilla = function () {
      function Chinchilla(definition, provider) {
        this.provider = provider;
        this.array = [];
        this.object = {};
        this.getter('$new', function () {
          return this._new();
        });
        this.getter('$dup', function () {
          return this._dup();
        });
        this.getter('$new', function () {
          return this._new();
        });
        this.getter('$context', function () {
          return this._context();
        });
        this.getter('$arr', function () {
          return this._arr();
        });
        this.getter('$obj', function () {
          return this._obj();
        });
        Definition.build(definition).ready(function (_this) {
          return function (d) {
            return _this._applyDefinition(d);
          };
        }(this));
      }
      Chinchilla.prototype.$do = function (action, params) {
      };
      Chinchilla.prototype._$new = function () {
      };
      Chinchilla.prototype._$dup = function () {
      };
      Chinchilla.prototype._$context = function () {
      };
      Chinchilla.prototype._$arr = function () {
        return this.array;
      };
      Chinchilla.prototype._$obj = function () {
        return this.object;
      };
      Chinchilla.prototype._applyDefinition = function (definition) {
      };
      return Chinchilla;
    }();
  });
}.call(this));
(function () {
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_Registry', function () {
    var Registry;
    return Registry = function () {
      function Registry() {
        this.data = {};
      }
      return Registry;
    }();
  });
}.call(this));