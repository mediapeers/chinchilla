angular.module('chinchilla').factory 'ChActionOperation', ($q, ChOperation, ChObjectsOperation, ChRequestBuilder, ChLazyLoader) ->
  # chainable operation class to run queries.
  class ChActionOperation extends ChOperation
    # @param [ChContextOperation] parent
    # @param [String] action 'member', 'collection' or null.
    #   if null, type will be determined based on association type, if any
    # @param [String] action action name, e.g. 'query'
    # @param [Object] params
    constructor: (@$parent, @$type, @$action, @$params = {}) ->
      ChOperation.init(@)

      @$subject = null
      @$arr = []
      @$obj = {}
      @$headers = {}

      success = =>
        # action operation used the parent's context
        @$context = @$parent.$context

        # use subject from parent only if object or array (no string!)
        @$subject = @$parent.$subject unless _.isString(@$parent.$subject)
        @$associationData = @$parent.$associationData
        @$associationProperty = @$parent.$associationProperty
        @$associationType = if @$associationProperty && @$associationProperty.collection then 'collection' else 'member'

        if _.isNull(@$type)
          # if type is not specified, try to guess from association
          @$type = if _.isArray(@$associationData) || _.isArray(@$parent.$subject)
            'collection'
          else if _.isPlainObject(@$associationType)
            'member'
          else
            @$associationType

        @_run()

      error = =>
        @$deferred.reject()

      @$parent.$promise.then success, error

    _run: ->
      builder = new ChRequestBuilder(@$context, @$subject, @$type, @$action)
      # DISASSEMBLE params from association references if available..
      # if collection association and data array of arrays => HABTM!
      if @$type == 'collection' && _.isArray(@$associationData) && _.isArray(_.first(@$associationData))
        flattenedAssociationData = _.flatten @$associationData
        builder.extractFrom(flattenedAssociationData, 'member')

      # if member association and data array => HABTM!
      else if @$type == 'member' && _.isArray(@$associationData)
        builder.extractFrom(@$associationData, 'member')

      # can be member and single object or
      # collection and array
      else
        builder.extractFrom(@$associationData, @$associationType)

      # DISASSEMBLE params from passed objects
      builder.extractFrom(@$subject, @$type)
      # add passed params
      builder.mergeParams(@$params)

      success = (response) =>
        data = (response.data && response.data.members) || response.data

        if _.isArray(data)
          _.each data, (member) => @$arr.push(member)
        else
          _.merge @$obj, data

        _.merge @$headers, response.headers()

        @_moveAssociations()
        @_initLazyLoading()

      error = (response) =>
        @$error = response.data
        _.merge @$headers, response.headers()

        @$deferred.reject()

      builder.performRequest().then success, error

    _objects: ->
      if _.isEmpty(@$obj) then @$arr else [@$obj]

    _moveAssociations: ->
      _.each @_objects(), (object) ->
        object.$associations ||= {}

        _.each object, (value, key) ->
          return if key == '$associations'

          if _.isArray(value) || (_.isPlainObject(value) && value['@id'])
            object.$associations[key] = _.clone(value)
            delete object[key]

    _initLazyLoading: ->
      self        = @
      groups      = _.groupBy @_objects(), '@context'
      promises    = []

      _.each groups, (records, contextUrl) ->
        operation = new ChObjectsOperation(records)
        operation.$promise.then -> new ChLazyLoader(operation, records)
        promises.push operation.$promise

      $q.all(promises).then -> self.$deferred.resolve(self)
