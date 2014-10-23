angular.module('chinchilla').factory 'ChLazyAssociation', ($injector) ->

  # specs:
  # - need to fetch data
  # - need to assign association objects to objects
  #   - cache association objects per object
  #   - resolve matching association objects using
  #     - collection template (isCollection = true)
  #     - member template (isCollection = false)
  class ChLazyAssociation
    constructor: (@$operation, @$objects, @$name) ->
      # holds association data per object once retrieved
      @cache = {}
      @isCollection = @$operation.$context.association(@$name).collection

      @_initCache()

    # makes sure data is fetched only once
    # returns the action operation
    load: ->
      @context ||= @$operation.$(@$name)
      @action ||= @context.$$('get').$promise.then @_assign.bind(@)

    # returns pointer to object
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


angular.module('chinchilla').factory 'ChLazyLoader', (ChLazyAssociation) ->
  class ChLazyLoader
    constructor: (@$operation, @$objects = []) ->
      # holds one instance of ChLazyAssociation per association
      @$cache   = {}

      @_turnLazy()

    _turnLazy: ->
      self = @

      _.each @$objects, (object) ->
        object.$associations ||= {}

        associations = {}
        _.each object, (value, key) ->
          return if key == '$associations'

          if _.isArray(value) || (_.isPlainObject(value) && value['@id'])
            associations[key] = _.clone(value)

        _.each associations, (value, key) ->
          object.$associations[key] = value

          Object.defineProperty object, key, get: -> self._association(key).retrieve(object)

    _association: (name) ->
      @$cache[name] ||= new ChLazyAssociation(@$operation, @$objects, name)
