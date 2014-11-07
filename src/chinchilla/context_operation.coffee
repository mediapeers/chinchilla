angular.module('chinchilla').factory 'ChContextOperation', ($q, ChOperation, ChContextService, ChUtils) ->
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

            assocData = (object) => object && object.$associations && object.$associations[@$subject]

            if !_.isEmpty(@$parent.$arr)
              @$associationData = _.map @$parent.$arr, (member) -> assocData(member)
            else
              @$associationData = assocData(@$parent.$obj)

          @_run()

        error = => @$deferred.reject()
        @$parent.$promise.then success, error

      else
        @_run()

    # creates a new object pointing to the current context
    #
    # @param [Object] attrs attributes to be merged into the new object
    # @return [Object]
    $new: (attrs = {}) ->
      deferred = $q.defer()
      result =
        $obj: _.extend({}, attrs)
        $deferred: deferred
        $promise: deferred.promise

      @$promise.then =>
        if @$associationData && @$associationProperty
          action = if @$associationProperty.collection
            @$context.collection_action('query')
          else
            @$context.member_action('get')

          result.$obj.$params = ChUtils.extractValues(action, @$associationData)

        result.$obj['@context'] = @$contextUrl
        deferred.resolve(result)

      result

    # finds context url first, then fetches the context.
    _run: ->
      @_findContextUrl(@$subject)

      success = (context) =>
        @$context = context
        @$deferred.resolve(@)

      error   = => @$deferred.reject()

      ChContextService.get(@$contextUrl).then(success, error)
