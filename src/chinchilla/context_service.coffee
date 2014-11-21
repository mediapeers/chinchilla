angular.module('chinchilla').factory 'ChContextService', ($q, $http, ChContext) ->
  # class that fetches contexts from backend and caches them.
  # singleton.
  class ChContextService
    constructor: ->
      @contexts = {}

    # @param [String] url of context to be fetched
    # @return [ChContext] context instance
    get: (url) ->
      deferred = $q.defer()

      if context = @contexts[url]
        deferred.resolve(context)
      else
        success = (response) =>
          context = new ChContext(response.data)
          @contexts[url] = context
          deferred.resolve(context)

        error = ->
          deferred.reject()

        $http.get(url).then success, error

      deferred.promise

  new ChContextService()
