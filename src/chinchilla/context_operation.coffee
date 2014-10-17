angular.module('chinchilla').factory 'ChContextOp', (ChOperation, ChActionOp, ChContextService) ->
  class ChContextOp extends ChOperation
    constructor: (@$parent = null, @$subject) ->
      super

      # if context called for an association, then park
      # association info here
      @$association = null

      if @$parent
        success = => @__run__()
        error   = => @$deferred.reject()

        @$parent.$promise.then success, error
      else
        @__run__()

    # fetches association
    $: (subject) ->
      new ChContextOp(@, subject)

    # executes action
    $$: (action, params = {}) ->
      new ChActionOp(@, null, action, params)

    # executes collection action
    $c: (action, params = {}) ->
      new ChActionOp(@, 'collection', action, params)

    # executes member action
    $m: (action, params = {}) ->
      new ChActionOp(@, 'member', action, params)

    __run__: ->
      @__findContextUrl__()

      success = (context) =>
        @$context = context
        @$deferred.resolve(@)
      error   = => @$deferred.reject()

      ChContextService.get(@$contextUrl).then(success, error)

    __findContextUrl__: ->
      @$contextUrl = null

      if _.isString(@$subject)
        try
          @$association = @$parent.$context.association(@$subject)
          @$contextUrl = @$association.type

        catch
          console.log @
          throw new Error("ChContextOp#__findContextUrl__: no association '#{@$subject}' found")

      else if _.isArray(@$subject)
        @$contextUrl = @$subject[0] %% @$subject[0]['@context']

        if !first || !@$contextUrl
          console.log @
          throw new Error('ChContextOp#__findContextUrl__: empty array of objects given or missing context')

        if _.any(@$subject, (current) -> current['@context'] != @$contextUrl)
          console.log @
          throw new Error('ChContextOp#__findContextUrl__: objects with different contexts given, aborting')

      else if _.isPlainObject(@$subject)
        @$contextUrl = @$subject['@context']

        if !@$contextUrl
          console.log @
          throw new Error('ChContextOp#__findContextUrl__: missing context')

      else
        console.log @
        throw new Error('ChContextOp#__findContextUrl__: unsupported subject')

