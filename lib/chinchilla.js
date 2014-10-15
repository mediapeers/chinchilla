(function () {
  var module, __slice = [].slice;
  module = angular.module('chinchilla', []);
  module.provider('$ch', function () {
    var provider;
    provider = this;
    this.options = { entryPoints: {} };
    this.entryPointManager = null;
    this.contextManager = null;
    this.setEntryPoint = function (name, url) {
      return this.options.entryPoints[name] = url;
    };
    this.$get = [
      'ch_Chinchilla',
      'ch_EntryPointManager',
      'ch_ContextManager',
      function (ch_Chinchilla, ch_EntryPointManager, ch_ContextManager) {
        provider.entryPointManager = new ch_EntryPointManager(provider.options.entryPoints);
        provider.contextManager = new ch_ContextManager();
        return function () {
          var arg1, arg2, arg3, args, options;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          options = {
            entryPointManager: provider.entryPointManager,
            contextManager: provider.entryPointManager
          };
          arg1 = args[0], arg2 = args[1], arg3 = args[2];
          switch (args.length) {
          case 0:
            return new ch_Chinchilla(options);
          case 1:
            return new ch_Chinchilla(arg1, options);
          case 2:
            return new ch_Chinchilla(arg1, arg2, options);
          case 3:
            return new ch_Chinchilla(arg1, arg2, arg3, options);
          default:
            throw Error('Wrong number of args (' + args.length + ') for $ch');
          }
        };
      }
    ];
    return provider;
  });
}.call(this));
(function () {
  var __slice = [].slice;
  angular.module('chinchilla').factory('ch_Chinchilla', [
    '$q',
    '$http',
    function ($q, $http) {
      var Chinchilla, DEFAULT_CHINCHILLA_OPTIONS;
      DEFAULT_CHINCHILLA_OPTIONS = {
        appName: null,
        entryPointManager: null,
        uri: null,
        type: null,
        anonymous: true,
        collection: false
      };
      return Chinchilla = function () {
        function Chinchilla() {
          var args, opts, _i;
          args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), opts = arguments[_i++];
          this.invocationChain = [];
          this.options = _.extend(DEFAULT_CHINCHILLA_OPTIONS, opts);
          this.data = null;
          switch (args.length) {
          case 0:
            this._constructor_0();
            break;
          case 1:
            this._constructor_1(args[0]);
            break;
          case 2:
            this._constructor_2(args[0], args[1]);
            break;
          default:
            throw Error('Wrong number of args (' + args.length + ') for Chinchilla#constructor');
          }
        }
        Chinchilla.prototype._constructor_0 = function () {
        };
        Chinchilla.prototype._constructor_1 = function (arg) {
          if (_.isObject(arg)) {
            if (_.isNull(arg)) {
              throw Error('Chinchilla#_constructor_1; Object argument is null');
            } else if (_.isArray(arg)) {
              return true;
            } else if (arg['__id__'] == null || arg['__type__'] == null) {
              throw Error('Chinchilla#_constructor_1; Object argument is in unknown format');
            } else {
              this.options.uri = arg.__id__;
              this.options.type = arg.__type__;
              this.data = arg;
              this._invoke('getEntryPoint');
              return this._invoke('getContext');
            }
          } else if (_.isString(arg)) {
            if (_.isEmpty(arg)) {
              throw Error('Chinchilla#_constructor_1; String argument is empty');
            } else if (/^https?\:\/\//i.test(arg)) {
              this.options.uri = arg;
              this._invoke('loadUri');
              this._invoke('getEntryPoint');
              return this._invoke('getContext');
            } else {
              this.options.type = arg;
              this._invoke('getEntryPoint');
              return this._invoke('getContext');
            }
          } else {
            throw Error('Chinchilla#_constructor_1; Argument is undefined');
          }
        };
        Chinchilla.prototype._constructor_2 = function (arg1, arg2) {
          if (!_.isString(arg1) || _.isEmpty(arg1)) {
            throw Error('Chinchilla#_constructor_2; Module argument is empty or not a string');
          }
          this.options.appName = arg1;
          return this._constructor_1(arg2);
        };
        Chinchilla.prototype.$do = function (action, params) {
          this._invoke('invokeRemote', action, params);
          return this;
        };
        Chinchilla.prototype.$new = function () {
          this._invoke('invokeLocal', '_new');
          return this;
        };
        Chinchilla.prototype.$dup = function () {
          this._invoke('invokeLocal', '_dup');
          return this;
        };
        Chinchilla.prototype._invoke = function () {
          var args, name;
          name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          name = '___' + name;
          if (!_.isFunction(this[name])) {
            throw Error('Unknown invocation ' + name + ' in Chinchilla#invoke');
          }
          this.invocationChain.push({
            name: name,
            args: args,
            invoked: false,
            succeded: false,
            errored: false
          });
          return this;
        };
        Chinchilla.prototype._exec = function () {
        };
        Chinchilla.prototype._execStep = function (element) {
          var retValue;
          if (element.invoked) {
            return;
          }
          element.invoked = true;
          retValue = that[element.name].apply(element.args);
          switch (retValue) {
          case 'ready':
            element.succeded = true;
            this._exec();
            break;
          case 'failed':
            element.errored = true;
            break;
          case 'invoked':
            false;
            break;
          default:
            retValue.then(function (_this) {
              return function (success) {
                element.succeded = true;
                return _this._exec();
              };
            }(this), function (err) {
              return element.errored = true;
            });
          }
          return _.each(this.invocationChain, function (element) {
          });
        };
        Chinchilla.prototype._new = function () {
        };
        Chinchilla.prototype._dup = function () {
        };
        Chinchilla.prototype.___getEntryPoint = function () {
          var appName, contextManager, entryPointManager, promise;
          entryPointManager = this.options.entryPointManager;
          contextManager = this.options.contextManager;
          appName = this.options.appName;
          if (entryPointManager.ready(appName)) {
            return 'ready';
          }
          if (entryPointManager.failed(appName)) {
            return 'failed';
          }
          if (entryPointManager.invoked(appName)) {
            return 'invoked';
          }
          promise = entryPointManager.resolve(appName);
          promise.then(function () {
            return _.each(entryPointManager.select(appName), function (entryPoint) {
              return _.each(entryPoint.contexts(), function (context) {
                return contextManager.register(appName, context);
              });
            });
          });
          return promise;
        };
        Chinchilla.prototype.___getContext = function () {
          return this.options.contextManager.resolve(this.options.appName, this.options.type);
        };
        Chinchilla.prototype.___loadUri = function () {
          var deferred, that;
          that = this;
          deferred = $q.defer;
          $http.get({ url: this.options.uri }).then(function (data) {
            that.data = data.data;
            return deferred.resolve();
          }, function (error) {
            return deferred.reject({
              data: data,
              status: status
            });
          });
          return deferred.promise;
        };
        Chinchilla.prototype.___invokeRemote = function (name, params) {
          var action, deferred, httpOptions, request, that;
          that = this;
          deferred = $q.defer();
          action = this.options.contextManager.get(this.options.type).findAction(name, this.options.anonymous, this.options.collection);
          throw Error('Unknown action ' + name + ' for ' + this.options.type);
          httpOptions = action.prepare(params);
          request = $http.get(httpOptions);
          return request.then(function (data) {
            return deferred.resolve();
          }, function (error) {
            return deferred.reject({
              data: data,
              status: status
            });
          });
        };
        Chinchilla.prototype.___invokeLocal = function (name, params) {
          return this[name](params);
        };
        return Chinchilla;
      }();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_Context', function () {
    var Action, Context;
    Action = function () {
      function Action() {
      }
      return Action;
    }();
    return Context = function () {
      function Context(namespace, name, url, options) {
        this.namespace = namespace;
        this.name = name;
        this.url = url;
        this.collection = !!options['collection'];
        this.deferred = $q.defer();
        this.promise = $q.promise;
        this.invoked = false;
        this.ready = false;
        this.failed = false;
        this.finished = false;
        this.data = null;
        this.err = null;
      }
      Context.prototype.resolve = function () {
        if (!this.invoked) {
          this.invoked = true;
          $http.get({ url: this.url }).then(function (_this) {
            return function (data) {
              _this.data = data.data;
              _this.ready = true;
              _this.finished = true;
              return _this.deferred.resolve();
            };
          }(this), function (_this) {
            return function (data, status) {
              _this.err = [
                data,
                status
              ];
              _this.failed = true;
              _this.finished = true;
              return _this.deferred.reject();
            };
          }(this));
        }
        return this;
      };
      Context.prototype.allActions = Context._allActions != null ? Context._allActions : Context._allActions = [].concat(Context.memberActions()).concat(Context.collectionActions());
      Context.prototype.memberActions = Context._memberActions != null ? Context._memberActions : Context._memberActions = _.map(Context.data['@context']['member_actions'], function (definition, name) {
        return new Action(name, definition);
      });
      Context.prototype.collectionActions = Context._collectionActions != null ? Context._collectionActions : Context._collectionActions = _.map(Context.data['@context']['collection_actions'], function (definition, name) {
        return new Action(name, definition);
      });
      Context.prototype.findAnyAction = function (name) {
        return _.find(this.allActions(), function (action) {
          return action.name === name;
        });
      };
      Context.prototype.findMemberAction = function (name) {
        return _.find(this.memberActions(), function (action) {
          return action.name === name;
        });
      };
      Context.prototype.findCollectionAction = function (name) {
        return _.find(this.collectionActions(), function (action) {
          return action.name === name;
        });
      };
      return Context;
    }();
  });
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_ContextManager', [
    'ch_Context',
    'ch_Tools',
    '$q',
    function (ch_Context, ch_Tools, $q) {
      var Context, ContextManager, Tools;
      Context = ch_Context;
      Tools = ch_Tools;
      return ContextManager = function () {
        function ContextManager() {
          this.namespaceIndex = {};
          this.nameIndex = {};
          this.complexIndex = {};
          this.contexts = [];
        }
        ContextManager.prototype.register = function (appName, definition) {
          var context, name, namespace, options, url, _base, _base1, _base2;
          if (this.complexIndex[appName][definition.name]) {
            return;
          }
          namespace = appName;
          name = definition.name;
          url = definition.url;
          options = _.omit(definition, [
            'name',
            'url'
          ]);
          context = new Context(namespace, name, url, options);
          this.contexts.push(context);
          if ((_base = this.namespaceIndex)[namespace] == null) {
            _base[namespace] = [];
          }
          this.namespaceIndex.push(context);
          if ((_base1 = this.nameIndex)[name] == null) {
            _base1[name] = [];
          }
          this.nameIndex[name].push(context);
          if ((_base2 = this.complexIndex)[namespace] == null) {
            _base2[namespace] = {};
          }
          return this.complexIndex[namespace][name] = context;
        };
        ContextManager.prototype.resolve = function (namespace, name) {
          var names, namespaces, promises;
          namespaces = Tools.toMultiarg(namespace, /.*/);
          names = Tools.toMultiarg(name, /.*/);
          promises = _.inject(this.contexts, function (_promises, context) {
            if (Tools.multiMatch(context.namespace, namespaces) && Tools.multiMatch(context.name, names)) {
              return _promises.push(context.resolve().promise);
            }
          }, []);
          return $q.all(promises);
        };
        ContextManager.prototype.findAction = function (namespace, name, actionName, allowCollection, allowMember) {
          var namespaces;
          namespaces = Tools.toMultiarg(namespace, /.*/);
          if (allowCollection && allowMember) {
            return this._findAnyAction(namespaces, name, actionName)(function () {
            });
          } else if (allowCollection) {
            return this._findCollectionAction(namespaces, name, actionName);
          } else if (allowMember) {
            return this._findMemberAction(namespaces, name, actionName);
          } else {
            throw Error('Unknown ContextManager#action type ' + name + '->' + actionName);
          }
        };
        ContextManager.prototype._findAnyAction = function (namespace, name, actionName) {
          var found;
          found = null;
          _.each(this.nameIndex[name], function (context) {
            var _found;
            if (Tools.multiMatch(context.namespace, namespaces)) {
              _found = context.findAnyAction(actionName);
              if (_found) {
                found = _found;
              }
            }
          });
          return found;
        };
        ContextManager.prototype._findCollectionAction = function (namespace, name, actionName) {
          var found;
          found = null;
          _.each(this.nameIndex[name], function (context) {
            var _found;
            if (Tools.multiMatch(context.namespace, namespaces)) {
              _found = context.findCollectionAction(actionName);
              if (_found) {
                found = _found;
              }
            }
          });
          return found;
        };
        ContextManager.prototype._findMemberAction = function (namespace, name, actionName) {
          var found;
          found = null;
          _.each(this.nameIndex[name], function (context) {
            var _found;
            if (Tools.multiMatch(context.namespace, namespaces)) {
              _found = context.findMemberAction(actionName);
              if (_found) {
                found = _found;
              }
            }
          });
          return found;
        };
        return ContextManager;
      }();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_EntryPoint', [
    '$q',
    '$http',
    function ($q, $http) {
      var EntryPoint;
      return EntryPoint = function () {
        function EntryPoint(name, url) {
          this.name = name;
          this.url = url;
          this.deferred = $q.defer();
          this.promise = $q.promise;
          this.invoked = false;
          this.ready = false;
          this.failed = false;
          this.finished = false;
          this.data = null;
          this.err = null;
        }
        EntryPoint.prototype.resolve = function () {
          if (!this.invoked) {
            this.invoked = true;
            $http.get({ url: this.url }).then(function (_this) {
              return function (data) {
                _this.data = data.data;
                _this.ready = true;
                _this.finished = true;
                return _this.deferred.resolve();
              };
            }(this), function (_this) {
              return function (data, status) {
                _this.err = [
                  data,
                  status
                ];
                _this.failed = true;
                _this.finished = true;
                return _this.deferred.reject();
              };
            }(this));
          }
          return this;
        };
        EntryPoint.prototype.contexts = function () {
          if (!this.ready) {
            throw Error('Entry point ' + this.name + ' is not ready');
          }
          if (this._contexts == null) {
            this._contexts = _.map(this.data['@context']['properties'], function (v, k) {
              return {
                name: k,
                url: v[type],
                collection: !!v['collection']
              };
            });
          }
          return this._contexts;
        };
        return EntryPoint;
      }();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_EntryPointManager', [
    'ch_EntryPoint',
    '$q',
    function (ch_EntryPoint, $q) {
      var EntryPoint, EntryPointManager;
      EntryPoint = ch_EntryPoint;
      return EntryPointManager = function () {
        function EntryPointManager(definitions) {
          this.entryPoints = _.clone(definitions);
          this.allNames = _.keys(definitions);
          _.each(this.entryPoints, function (_this) {
            return function (v, k) {
              return _this.entryPoints[k] = new EntryPoint(v, k);
            };
          }(this));
        }
        EntryPointManager.prototype.resolve = function (name) {
          var names, promises;
          names = this._prepareNames(name);
          promises = _.map(names, function (_this) {
            return function (name) {
              return _this.entryPoints[name].resolve().promise;
            };
          }(this));
          return $q.all(promises);
        };
        EntryPointManager.prototype.invoked = function (name) {
          var names;
          names = this._prepareNames(name);
          return _.every(names, function (_this) {
            return function (name) {
              return _this.entryPoints[name].invoked;
            };
          }(this));
        };
        EntryPointManager.prototype.ready = function (name) {
          var names;
          names = this._prepareNames(name);
          return _.every(names, function (_this) {
            return function (name) {
              return _this.entryPoints[name].ready;
            };
          }(this));
        };
        EntryPointManager.prototype.failed = function (name) {
          var names;
          names = this._prepareNames(name);
          return _.some(names, function (_this) {
            return function (name) {
              return _this.entryPoints[name].failed;
            };
          }(this));
        };
        EntryPointManager.prototype.finished = function (name) {
          var names;
          names = this._prepareNames(name);
          return _.every(names, function (_this) {
            return function (name) {
              return _this.entryPoints[name].finished;
            };
          }(this));
        };
        EntryPointManager.prototype.select = function (name) {
          var names;
          names = this._prepareNames(name);
          return _.pick(this.entryPoints, names);
        };
        EntryPointManager.prototype._prepareNames = function (name) {
          var names, that;
          names = null;
          that = this;
          if (name) {
            if (_.isArray(name)) {
              if (_.isEmpty(name)) {
                names = this.allNames;
              } else {
                names = name;
              }
            } else {
              names = [name];
            }
            _.each(names, function (name) {
              if (!_.has(that.entryPoints, name)) {
                throw Error('Can not resolve entry point ' + name);
              }
            });
          } else {
            names = this.allNames;
          }
          return names;
        };
        return EntryPointManager;
      }();
    }
  ]);
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_ContextManager', [
    'ch_Tools',
    function (ch_Tools) {
      var multiMatch, toMultiarg;
      toMultiarg = function (arg, defaults) {
        var args;
        args = null;
        if (arg) {
          if (_.isArray(arg)) {
            if (_.isEmpty(arg)) {
              args = defaults;
            } else {
              args = arg;
            }
          } else {
            args = [arg];
          }
        } else {
          args = defaults;
        }
        return args;
      };
      multiMatch = function (value, matcher) {
        if (_.isRegExp(matcher)) {
          matcher.test(value);
        }
        if (_.isArray(matcher)) {
          return !!_.detect(matcher, value);
        } else {
          return false;
        }
      };
      return {
        toMultiarg: toMultiarg,
        multiMatch: multiMatch
      };
    }
  ]);
}.call(this));