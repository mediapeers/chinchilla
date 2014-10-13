(function () {
  var module;
  module = angular.module('Chinchilla', []);
  module.factory('chinchilla', function () {
    return { foo: true };
  });
}.call(this));
(function () {
  angular.module('chinchilla').factory('ch_Foo', function () {
    return { foo: true };
  });
}.call(this));