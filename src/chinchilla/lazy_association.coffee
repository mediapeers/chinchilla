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
      @context ||= @$operation.$(@$name)
      @action ||= @context.$$('get').$promise.then @_assign.bind(@)

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
      _.each @objects, (object) =>
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

      sortedResults = {}
      _.each results, (object) -> sortedResults[object['id'].toString()] = object

      if @isCollection
        # each object may get assigned multiple association result objects
        action = actionOp.$context.collection_action('get')

        _.each @$objects, (object) ->
          console.log object.$associations[@$name]
      else
        @context.member_template('get')
