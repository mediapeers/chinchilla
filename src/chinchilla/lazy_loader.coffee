angular.module('chinchilla').factory 'ChLazyLoader', (ChLazyAssociation) ->
  # changes objects by putting association references aside and replacing them
  # with getters that allow access to association data that is lazy loaded
  # (using the references) via multi get for all objects it was initialized for.
  # caches one ChLazyAssociation instance per association.
  #
  # @example
  #   $ch('um').$('users').$$('query').then (operation) ->
  #     new ChLazyLoader(operation, operation.$arr)
  class ChLazyLoader
    # @param [ChActionOperation]
    # @param [Array<Object>] objects array of objects you want to lazy load associations for
    constructor: (@$operation, @$objects = []) ->
      # holds one instance of ChLazyAssociation per association
      @$cache   = {}

      @_turnLazy()

    # modifies objects and init getters
    _turnLazy: ->
      self = @

      _.each @$objects, (object) ->
        return unless object.$associations

        _.each object.$associations, (value, key) ->
          Object.defineProperty object, key, get: -> self._association(key).retrieve(object)

    # init ChLazyAssociation instance
    #
    # @param [String] name association name
    _association: (name) ->
      @$cache[name] ||= new ChLazyAssociation(@$operation, @$objects, name)
