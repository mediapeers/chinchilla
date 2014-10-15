angular.module('chinchilla').factory 'ch_Context', () ->
  # internal class
  class Action

  # exposed class
  class Context
    constructor: (@namespace, @name, @url, options) ->
      @collection = !!options['collection']

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

    allActions:
      @_allActions ?= [].concat(@memberActions()).concat(@collectionActions())

    memberActions:
      @_memberActions ?= _.map @data['@context']['member_actions'], (definition, name) ->
        new Action(name, definition)

    collectionActions:
      @_collectionActions ?= _.map @data['@context']['collection_actions'], (definition, name) ->
        new Action(name, definition)

    findAnyAction: (name) ->
      _.find @allActions(), (action) -> action.name == name

    findMemberAction: (name) ->
      _.find @memberActions(), (action) -> action.name == name

    findCollectionAction: (name) ->
      _.find @collectionActions(), (action) -> action.name == name




