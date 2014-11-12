angular.module('chinchilla').factory 'ChContext', ($log) ->
  # context wrapper with some helper functions to fetch actions and association
  # context information.
  class ChContext
    # @param [Object] data context data
    constructor: (@data = {}) ->

    # @param [String] name name of property
    property: (name) ->
      context = @data && @data['@context']
      context && context.properties && context.properties[name]

    # @param [String] name name of association
    association: (name) ->
      assoc = @property(name)
      assoc if _.isPlainObject(assoc) && assoc.type && assoc.type.match(/^(http|https)\:/)

    # @param [String] name name of member action
    member_action: (name) ->
      context = @data && @data['@context']
      action  = context && context.member_actions && context.member_actions[name]
      unless action
        $log.warn("requested non-existing member action '#{name}' in following context:")
        $log.warn(@data)

      action

    # @param [String] name name of collection action
    collection_action: (name) ->
      context = @data && @data['@context']
      action  = context && context.collection_actions && context.collection_actions[name]
      unless action
        $log.warn("requested non-existing collection action '#{name}' in following context:")
        $log.warn(@data)

      action
