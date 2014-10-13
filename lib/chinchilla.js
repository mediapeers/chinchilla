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
      function (ch_Chinchilla) {
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
    var Chinchilla;
    return Chinchilla = function () {
      function Chinchilla(definition, provider) {
        this.provider = provider;
        console.log('Chinchilla is initialized: ' + definition);
        console.log(this.provider.endpoints);
      }
      return Chinchilla;
    }();
  });
}.call(this));