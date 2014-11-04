angular.module('chinchilla').factory 'ChObjectsOperation', (ChOperation, ChContextService) ->
  # chainable operation class to run queries.
  # fetches context for given set of objects.
  class ChObjectsOperation extends ChOperation
    constructor: (@$objects) ->
      ChOperation.init(@)

      @$arr = []
      @$obj = {}
      @$headers = {}
      @$contextUrl = null

      if _.isArray(@$objects)
        @$arr = @$objects
      else
        @$obj = @$objects

      @_run()

    # finds context url first, then fetches the context.
    _run: ->
      @_findContextUrl(@$objects)

      success = (context) =>
        @$context = context
        @$deferred.resolve(@)

      error   = => @$deferred.reject()

      ChContextService.get(@$contextUrl).then(success, error)

