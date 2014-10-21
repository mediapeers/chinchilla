angular.module('chinchilla').factory 'ChOperation', ($q, $injector) ->
  class ChOperation
    @init = (instance) ->
      instance.$context = null
      instance.$error = {}
      instance.$deferred = $q.defer()
      instance.$promise = instance.$deferred.promise
      instance.ChContextOp = $injector.get('ChContextOp')
      instance.ChActionOp  = $injector.get('ChActionOp')

    # fetches association
    $: (subject) ->
      contextOp = new @ChContextOp(@, subject)

    # executes action
    $$: (action, params = {}) ->
      new @ChActionOp(@, null, action, params)

    # executes collection action
    $c: (action, params = {}) ->
      new @ChActionOp(@, 'collection', action, params)

    # executes member action
    $m: (action, params = {}) ->
      new @ChActionOp(@, 'member', action, params)
