angular.module('chinchilla').factory 'ChContextService', ($q, $http, $chTimestampedUrl, ChContext) ->
  contexts: {}
  pendingRequests: {}

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
        @_resolvePendingRequests(url, context)

      error = =>
        @_rejectPendingRequests(url)

      if @pendingRequests[url]
        @_addToPendingRequests(url, deferred)
      else
        @_addToPendingRequests(url, deferred)
        $http.get($chTimestampedUrl(url)).then success, error

    deferred.promise

  _addToPendingRequests: (url, deferred) ->
    @pendingRequests[url] ||= []
    @pendingRequests[url].push(deferred)

  _resolvePendingRequests: (url, context) ->
    _.each @pendingRequests[url], (deferred) ->
      deferred.resolve(context)

  _rejectPendingRequests: (url) ->
    _.each @pendingRequests[url], (deferred) ->
      deferred.reject()
