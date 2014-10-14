angular.module('chinchilla').factory 'ch_Chinchilla', () ->
  Function::getter = (prop, get) ->
    Object.defineProperty @prototype, prop, {get, configurable: yes}

  class Definition

  class StringDefinition
    constructor: (definition) ->
    type: () ->
    apiMethods: () ->

  class UriDefinition
    constructor: (definition) ->
    type: () ->
    apiMethods: () ->

  class ObjectDefinition
    constructor: (definition) ->
    type: () ->
    apiMethods: () ->

  class ArrayDefinition
    constructor: (definition) ->
    type: () ->
    apiMethods: () ->

  Definition.prototype.build = (definition) ->
    if _.isString(definition)
      if definition.match /https?\:\/\//
        new UriDefinition(definition)
      else
        new StringDefinition(definition)
    else if _.isObject(definition)
      if _.isArray(definition)
        new ArrayDefinition(definition)
      else
        new ObjectDefinition(definition)


  class Chinchilla
    constructor: (definition, @provider) ->
      @array = []
      @object = {}

      @getter '$new',     -> @_new()
      @getter '$dup',     -> @_dup()
      @getter '$new',     -> @_new()
      @getter '$context', -> @_context()
      @getter '$arr',     -> @_arr()
      @getter '$obj',     -> @_obj()

      Definition.build(definition).ready (d) => @_applyDefinition(d)

    $do: (action, params) ->

    # private methods
    _$new: ->
    _$dup: ->
    _$context: ->

    _$arr: ->
      @array

    _$obj: ->
      @object

    _applyDefinition: (definition) ->





# TODO:
## definition parser


## load entry points
## load context list

## load context
##
