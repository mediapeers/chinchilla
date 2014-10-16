angular.module('chinchilla').factory 'ChContext', ->
  class ChContext
    constructor: (@data = {}) ->

    property: (name) ->
      context = @data && @data['@context']
      context && context.properties && context.properties[name]

    association: (name) ->
      assoc = @property(name)
      assoc if _.isPlainObject(assoc)
