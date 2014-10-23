angular.module('chinchilla').factory 'ChContextOp', (ChOperation, ChContextService) ->
  class ChContextOp extends ChOperation
    constructor: (@$parent = null, @$subject) ->
      ChOperation.init(@)

      # if context called for an association, then park
      # association info here
      @$associationProperty = null
      @$associationData = null

      if @$parent
        success = =>
          if _.isString(@$subject)
            # requesting association context..
            @$associationProperty = @$parent.$context.association(@$subject)
            @$associationData     = null

            assocData = (object) => object && object[@$subject]

            data = @$parent.$rawData
            if _.isArray(data)
              @$associationData = _.map data, (member) -> assocData(member)
            else
              @$associationData = assocData(data)

          @__run__()

        error = => @$deferred.reject()
        @$parent.$promise.then success, error

      else
        @__run__()

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
        @$contextUrl = @$associationProperty && @$associationProperty.type

        unless @$contextUrl
          throw new Error("ChContextOp#__findContextUrl__: no association '#{@$subject}' found")

      else if _.isArray(@$subject)
        @$contextUrl = @$subject[0] && @$subject[0]['@context']

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

