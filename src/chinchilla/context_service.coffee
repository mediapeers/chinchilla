angular.module('chinchilla').factory 'ChContextService', ($q, $http, ChContext) ->
  # this is the cache
  contexts = {}

  # TODO there is no multi get for contexts currently
  get: (url) ->
    deferred = $q.defer()

    if context = contexts[url]
      deferred.resolve(context)
    else
      success = (response) ->
        context = new ChContext(response.data)
        contexts[url] = context
        deferred.resolve(context)

      error = ->
        deferred.reject()

      $http.get(url).then success, error

    deferred.promise
