angular.module('chinchilla').factory 'ChActionOp', (ChOperation, ChRequestBuilder) ->
  class ChActionOp extends ChOperation
    constructor: (@$parent, @$type, @$action, @$params = {}) ->
      ChOperation.init(@)

      @$subject = null
      @$data = null
      @$arr = []
      @$obj = {}

      success = =>
        @$context = @$parent.$context

        # use subject from parent only if object or array (no string!)
        @$subject = @$parent.$subject unless _.isString(@$parent.$subject)
        @$associationData = @$parent.$associationData
        @$associationProperty = @$parent.$associationProperty
        @$associationType = if @$associationProperty && @$associationProperty.collection then 'collection' else 'member'

        if _.isNull(@$type) && @$associationType
          # if type is not specified, try to guess from association info (one vs many)
          @$type = @$associationType

        @__run__()

      error = =>
        @$deferred.reject()

      @$parent.$promise.then success, error

    __run__: ->
      builder = new ChRequestBuilder(@$context, @$subject, @$type, @$action)

      # if collection association and data array of arrays => HABTM!
      if @$type == 'collection' && _.isArray(@$associationData) && _.isArray(_.first(@$associationData))
        _.each @$associationData, (data) -> builder.extractFrom(data, 'member')

      # if member association and data array => HABTM!
      else if @$type == 'member' && _.isArray(@$associationData)
        builder.extractFrom(@$associationData, 'member')

      else
        builder.extractFrom(@$associationData, @$associationType)

      builder.extractFrom(@$subject, @$type)
      builder.mergeParams(@$params)

      success = (response) =>
        @$data = response.data

        if response.data.members
          @$arr = response.data.members
        else
          @$obj = response.data

        @$deferred.resolve(@)
      error = =>
        @$deferred.reject()

      builder.performRequest().then success, error
