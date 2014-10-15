angular.module('chinchilla').factory 'ch_EntryPoint', ($q, $http) ->
  class EntryPoint
    constructor: (@name, @url) ->
      @deferred = $q.defer()
      @promise = $q.promise

      @invoked = false
      @ready = false
      @failed = false
      @finished = false

      @data = null
      @err = null

    resolve: () ->
      if !@invoked
        @invoked = true

        $http.get(url: @url).then (data) =>
          @data = data.data
          @ready = true
          @finished = true
          @deferred.resolve()

        , (data, status) =>
          @err = [data, status]
          @failed = true
          @finished = true
          @deferred.reject()

      # we love chaining
      @

    contexts: ->
      throw Error("Entry point #{@name} is not ready") unless @ready

      @_contexts ?= _.map @data['@context']['properties'], (v, k) ->
        {name: k, url: v[type], collection: !!v['collection']}

      @_contexts







