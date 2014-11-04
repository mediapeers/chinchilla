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

    # finds context url
    # if $subject is string, then it assumes this is the name of an association
    # (will fail if no parent context operation available).
    # if $subject is an object, object has to provide @context url.
    # if $subject is an array of objects, all objects have to provide the same @context url
    _findContextUrl: (subject) ->
      @$contextUrl = null

      if _.isString(subject)
        @$contextUrl = @$associationProperty && @$associationProperty.type

        unless @$contextUrl
          throw new Error("ChContextOperation#_findContextUrl: no association '#{subject}' found")

      else if _.isArray(subject)
        first = subject[0]
        @$contextUrl = subject[0] && subject[0]['@context']

        if !first || !@$contextUrl
          console.log @
          throw new Error('ChContextOperation#_findContextUrl: empty array of objects given or missing context')

        if _.any(subject, (current) => current['@context'] != @$contextUrl)
          console.log @
          throw new Error('ChContextOperation#_findContextUrl: objects with different contexts given, aborting')

      else if _.isPlainObject(subject)
        @$contextUrl = subject['@context']

        if !@$contextUrl
          console.log @
          throw new Error('ChContextOperation#_findContextUrl: missing context')

      else
        console.log @
        throw new Error('ChContextOperation#_findContextUrl: unsupported subject')
