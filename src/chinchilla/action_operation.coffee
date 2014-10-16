angular.module('chinchilla').factory 'ChActionOp', (ChOperation) ->
  class ChActionOp extends ChOperation
    constructor: (@$parent, @$type, @$subject, @$params = {}) ->
      super

      @$data = null
      @$arr = []
      @$obj = {}

      if @$parent
        success = =>
          @$context = @$parent.$context

          if _.isNull(@$type) && (association = @$parent.$association)
            # if type is not specified, try to guess from association info (one vs many)
            @$type = if association.collection then 'collection' else 'member'

          @__run__()

        error   = =>
          @$deferred.reject()

        @$parent.$promise.then success, error

    __run__: ->
      # actually executes the action request
      # does sth here, then...
      @$deferred.resolve({})
