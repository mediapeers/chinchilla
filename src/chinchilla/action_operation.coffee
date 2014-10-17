angular.module('chinchilla').factory 'ChActionOp', (ChOperation, ChRequestBuilder) ->
  class ChActionOp extends ChOperation
    constructor: (@$parent, @$type, @$action, @$params = {}) ->
      super

      @$subject = null
      @$data = null
      @$arr = []
      @$obj = {}

      if @$parent
        success = =>
          @$context = @$parent.$context

          # use subject from parent only if object or array (no string!)
          @$subject = @$parent.$subject unless _.isString(@$parent.$subject)

          if _.isNull(@$type) && (association = @$parent.$association)
            # if type is not specified, try to guess from association info (one vs many)
            @$type = if association.collection then 'collection' else 'member'

          @__run__()

        error   = =>
          @$deferred.reject()

        @$parent.$promise.then success, error

    __run__: ->
      builder = ChRequestBuilder.init(@$context, @$subject, @$type, @$action, @$params)
      builder.performRequest().then (response) =>
        @$data = response.data
        @$deferred.resolve(@)
