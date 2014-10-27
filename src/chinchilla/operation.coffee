angular.module('chinchilla').factory 'ChOperation', ($q, $injector) ->
  # @abstract
  # abstract class that provides basic functionality for chainable operations.
  class ChOperation
    # helper function to initialize operation. is used instead of super constructor as this
    # doesn't work with coffeescript very well.
    @init = (instance) ->
      instance.$context = null
      instance.$error = {}
      instance.$deferred = $q.defer()
      instance.$promise = instance.$deferred.promise
      instance.ChContextOperation = $injector.get('ChContextOperation')
      instance.ChActionOperation  = $injector.get('ChActionOperation')

    # returns new chained context operation
    #
    # @param [String|Object|Array<Object>] subject
    # @return [ChContextOperation]
    $: (subject) ->
      contextOp = new @ChContextOperation(@, subject)

    # returns new chained magic action operation. magic means type ('collection' or 'member')
    # is automatically guessed based on association type. will create 'collection' action
    # for has many association. will create 'member' action for has one / belongs to association.
    #
    # @param [String] action, e.g. 'get'
    # @return [ChActionOperation]
    $$: (action, params = {}) ->
      new @ChActionOperation(@, null, action, params)

    # returns new chained collection action operation.
    #
    # @param [String] action, e.g. 'get'
    # @return [ChActionOperation]
    $c: (action, params = {}) ->
      new @ChActionOperation(@, 'collection', action, params)

    # returns new chained member action operation.
    #
    # @param [String] action, e.g. 'get'
    # @return [ChActionOperation]
    $m: (action, params = {}) ->
      new @ChActionOperation(@, 'member', action, params)
