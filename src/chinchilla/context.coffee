angular.module('chinchilla').factory 'ChContext', ->
  class ChContext
    constructor: (@data = {}) ->

    property: (name) ->
      context = @data && @data['@context']
      context && context.properties && context.properties[name]

    association: (name) ->
      assoc = @property(name)
      assoc if _.isPlainObject(assoc)

    member_action: (name) ->
      context = @data && @data['@context']
      action  = context && context.member_actions && context.member_actions[name]
      throw new Error("requested non-existing member action '#{name}'") unless action

      action

    collection_action: (name) ->
      context = @data && @data['@context']
      action  = context && context.collection_actions && context.collection_actions[name]
      throw new Error("requested non-existing collection action '#{name}'") unless action

      action