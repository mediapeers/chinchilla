angular.module('chinchilla').factory 'ChOperation', ($q) ->
  class ChOperation
    constructor: ->
      @$context = null
      @$error = {}
      @$deferred = $q.defer()
      @$promise = @$deferred.promise
