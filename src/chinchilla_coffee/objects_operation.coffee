angular.module('chinchilla').factory 'ChObjectsOperation', (ChOperation, ChContextService) ->
  # chainable operation class to run queries. fetches context for given set of objects.
  # mainly used for running association queries because it takes parent (given) objects into consideration
  # when building the query.
  #
  # @example
  #   user = { id: 3, '@context': ... }
  #   op = new ChObjectsOperation(user)
  #   op.$('phones').$c('query')
  #   # -> 'http://backend/users/3/phones'
  class ChObjectsOperation extends ChOperation
    # @param [Object|Array<Object>] objects
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

