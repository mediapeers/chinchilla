angular.module('chinchilla').factory 'ChLazyAssociation', ($injector) ->
  class ChLazyAssociation
    constructor: (@$operation, @$name) ->
      # holds association data per object once retrieved
      @cache = {}

    # makes sure data is fetched only once
    # returns the action operation
    load: ->
      @context ||= @$operation.$(@$name)
      @action ||= @context.$$('get')

    # returns pointer to object
    retrieve: (object) ->


angular.module('chinchilla').factory 'ChLazyLoader', (ChLazyAssociation) ->
  class ChLazyLoader
    constructor: (@$operation) ->
      @$objects = if _.isArray(@$operation.$data) then @$operation.$data else [@$operation.$data]
      @$cache   = {}

      @_turnLazy()

    _turnLazy: ->
      self = @

      _.each @$objects, (object) ->
        object.$associations ||= {}

        _.each object, (value, key) ->
          return if key == '$associations'

          if _.isArray(value) || (_.isPlainObject(value) && value['@id'])
            object.$associations[key] = reference: _.clone(value)

            #Object.defineProperty object, key, get: ->
              #self._association.retrieve(object)

    _association: (name) ->
      @$cache[name] ||= new ChLazyAssociation(@$operation, @$objects, name)

    # find objects
    # turn result into array

