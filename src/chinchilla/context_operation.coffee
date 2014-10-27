angular.module('chinchilla').factory 'ChContextOperation', (ChOperation, ChContextService) ->
  # chainable operation class to fetch contexts.
  class ChContextOperation extends ChOperation
    # @param [ChOperation] parent might be ChActionOperation or ChContextOperation
    # @param [String|Object|Array<Object>] subject
    #
    # @example
    #   $ch('um').$('users')
    #
    # @example
    #   $ch('um').$('@context': 'http://um/context/user', id: 5, name: 'foo')
    #
    # @example
    #   # will use these objects for future action operations
    #   $ch('um').$(
    #       '@context': 'http://um/context/user', id: 5, name: 'foo'
    #     ,
    #       '@context': 'http://um/context/user', id: 6, name: 'bar'
    #   )
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

          @_run()

        error = => @$deferred.reject()
        @$parent.$promise.then success, error

      else
        @_run()

    # finds context url first, then fetches the context.
    _run: ->
      @_findContextUrl()

      success = (context) =>
        @$context = context
        @$deferred.resolve(@)

      error   = => @$deferred.reject()

      ChContextService.get(@$contextUrl).then(success, error)

    # finds context url
    # if $subject is string, then it assumes this is the name of an association
    # (will fail if no parent context operation available).
    # if $subject is an object, object has to provide @context url.
    # if $subject is an array of objects, all objects have to provide the same @context url
    _findContextUrl: ->
      @$contextUrl = null

      if _.isString(@$subject)
        @$contextUrl = @$associationProperty && @$associationProperty.type

        unless @$contextUrl
          throw new Error("ChContextOperation#_findContextUrl: no association '#{@$subject}' found")

      else if _.isArray(@$subject)
        @$contextUrl = @$subject[0] && @$subject[0]['@context']

        if !first || !@$contextUrl
          console.log @
          throw new Error('ChContextOperation#_findContextUrl: empty array of objects given or missing context')

        if _.any(@$subject, (current) -> current['@context'] != @$contextUrl)
          console.log @
          throw new Error('ChContextOperation#_findContextUrl: objects with different contexts given, aborting')

      else if _.isPlainObject(@$subject)
        @$contextUrl = @$subject['@context']

        if !@$contextUrl
          console.log @
          throw new Error('ChContextOperation#_findContextUrl: missing context')

      else
        console.log @
        throw new Error('ChContextOperation#_findContextUrl: unsupported subject')
