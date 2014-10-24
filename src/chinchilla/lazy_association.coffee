angular.module('chinchilla').factory 'ChLazyAssociation', ($injector) ->
  # lazy loading for associations. loads association data (via multi get) if multiple
  # objects passed. accessing the association for one objects loads them all in one
  # request.
  # doesn't need to be used manually though, as ChLazyLoader wraps the functionality
  # via simple getter functions.
  #
  # @example to illustrate how it could be used manually
  #   $ch('um').$('users').$$('query').$promise.then (operation) ->
  #     lazy = new ChLazyAssociation(operation, operation.$arr, 'phones')
  #     user = operation.$arr[0]
  #     user.phones # loads all phones for all users!
  class ChLazyAssociation
    # @param [ChActionOperation] operation
    # @param [Array<Object>] objects array of objects you want to lazy load association for
    # @param [String] name of the association
    constructor: (@$operation, @$objects, @$name) ->
      # holds association data per object once retrieved
      @cache = {}
      @isCollection = @$operation.$context.association(@$name).collection

      @_initCache()

    # loads association data by executing the necessary operations.
    #
    # @return [promise] promise of association action operation
    load: ->
      @contextOperation ||= @$operation.$(@$name)
      @actionOperation  ||= @contextOperation.$$('get', per: 100).$promise.then @_assign.bind(@)

    # fetch association for specific object.
    # triggers load if necessary.
    #
    # @return [Object] association object
    retrieve: (object) ->
      @load()
      @cache[object['@id']]

    # inits the cache for all objects
    # creates objects/arrays depending on the association type
    # one can bind to
    _initCache: ->
      _.each @$objects, (object) =>
        @cache[object['@id']] = if @isCollection
          []
        else
          {}

    # callback for association loading. assigns fetched data to all objects
    # ChLazyAssociation was initialized for.
    #
    # @param [ChActionOperation] actionOp
    _assign: (actionOp) ->
      results = if _.isArray(actionOp.$rawData) then actionOp.$rawData else [actionOp.$rawData]

      if @isCollection
        # check if HABTM
        habtm = _.any @$objects, (object) =>
          reference = object.$associations && object.$associations[@$name]
          return unless reference

          _.isArray(reference)

        if habtm
          # HAS AND BELONGS TO MANY
          sortedResults = {}
          _.each results, (result) -> sortedResults[result['@id']] = result

          _.each @$objects, (object) =>
            references = object.$associations && object.$associations[@$name]
            return unless _.isArray(references)

            _.each references, (reference) =>
              result = sortedResults[reference['@id']]
              return unless result

              @cache[object['@id']].push(result)
        else
          # HAS MANY
          # find back reference association, -> association that points to same context the parent context does
          # say you want to load user phones..
          # - @$operation is a user action operation, which $context is the user context
          # - @contextOperation.$context is the phone context
          # - -> find the association inside of phone context which points to @id of user context
          parentContextId = @$operation.$context.data['@context']['@id']
          associationName = _.findKey @contextOperation.$context.data['@context']['properties'], (value, key) ->
            value && value.type && value.type == parentContextId

          _.each results, (result) =>
            backReference = result && result[associationName] && result[associationName]['@id']
            return unless backReference

            @cache[backReference].push(result)
      else
        sortedResults = {}
        _.each results, (result) -> sortedResults[result['@id']] = result
        _.each @$objects, (object) =>
          requestedId = object.$associations && object.$associations[@$name] && object.$associations[@$name]['@id']
          return unless requestedId

          result = sortedResults[requestedId]
          return unless result

          _.merge @cache[object['@id']], result

