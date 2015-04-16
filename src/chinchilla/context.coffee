angular.module('chinchilla').factory 'ChContext', ($log) ->
  # context wrapper with some helper functions to fetch actions and association
  # context information.
  class ChContext
    isAssociation = (property) ->

    # @param [Object] data context data
    constructor: (@data = {}) ->
      @context    = @data && @data['@context'] || {}
      @properties = @context.properties || {}
      @constants  = @context.constants || {}

      # mark associations
      _.each @properties, (property, name) ->
        property.isAssociation = property.type && /^(http|https)\:/.test(property.type)
        true # continue loop

    # @param [String] name name of property
    property: (name) ->
      @properties[name]

    # @param [String] name name of constant
    constant: (name) ->
      @constants[name]

    # @param [String] name name of association
    association: (name) ->
      property = @properties[name]
      property.isAssociation && property

    # @param [String] name name of member action
    member_action: (name) ->
      context = @data && @data['@context']
      action  = context && context.member_actions && context.member_actions[name]
      unless action
        $log.warn("requested non-existing member action '#{name}'")
        $log.debug(@data)

      action

    # @param [String] name name of collection action
    collection_action: (name) ->
      context = @data && @data['@context']
      action  = context && context.collection_actions && context.collection_actions[name]
      unless action
        $log.warn("requested non-existing collection action '#{name}'")
        $log.debug(@data)

      action
