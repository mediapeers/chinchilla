angular.module('chinchilla').factory 'ChRequestBuilder', ($q, $injector, $http) ->
  # class to build and run requests. uses template to extract needed params from existing
  # objects and to build request url.
  class ChRequestBuilder
    # @param [ChContext] $context
    # @param [Object|Array<Object>] subject concrete objects to run request for
    # @param [String] type 'member' or 'collection'
    # @param [String] action e.g. 'query'
    constructor: (@$context, @$subject, @$type, @$action) ->
      @$mergedParams = {}

    # extracts params from object(s).
    # source is association reference, association type is member       => use member template
    # source is association reference, association type is collection   => use collection template
    # source is array, type is collection                               => use member template (HABTM)
    # source is array, type is collection                               => use member template (HABTM)
    # source is array, type is member                                   => DOES NOT MAKE SENSE
    # source is object, type is member                                  => use member template
    # source is object, type is collection                              => use collection template
    #
    # source is object     => output e.g. { id: 2, name: 'foo' }
    # source is array      => output e.g. { id: [1, 2], name: ['foo', 'bar']}
    extractFrom: (source, type) ->
      params = if _.isArray(source) && type == 'member'
        @_extractMemberArray(source)
      else if _.isArray(source) && type == 'collection'
        @_extractCollectionArray(source)
      else
        if type == 'collection'
          @_extractCollection(source)
        else
          @_extractMember(source)

      @mergeParams(params)
      params

    # adds more params
    #
    # @param [Object]
    mergeParams: (params) ->
      _.merge @$mergedParams, params || {}

    # finally runs the request
    performRequest: ->
      action = if @$type == 'collection'
        @$context.collection_action(@$action)
      else
        @$context.member_action(@$action)

      data = if _.include(['POST', 'PUT', 'PATCH'], action.method)
        @data()
      else
        null

      $http(
        method: action.method
        url: @buildUrl(action)
        data: data
      )

    # builds the url with all previously collected params.
    #
    # @param [Object] action action from context
    buildUrl: (action) ->
      uriTmpl = new UriTemplate(action.template)
      uriTmpl.fillFromObject(@_buildParams(action))

    # builds body data. if $subject is an array of objects a nested data object is created
    # containing each object's data, referenced by object id
    data: ->
      if @$type == 'collection'
        result = {}
        _.each @$subject, (obj) -> result[obj.id] = obj
        result
      else
        @$subject

    # builds params using action template from context
    #
    # @param [Object] action action from context
    _buildParams: (action) ->
      mappings  = action.mappings
      result    = {}

      _.each mappings, (mapping) =>
        value = @$mergedParams[mapping.source] || @$mergedParams[mapping.variable]
        return unless value
        result[mapping.variable] = value

      result

    _extractMemberArray: (source) ->
      return {} if _.isEmpty(source)
      action    = @$context.member_action('get')
      @_extractArrayValues(action, source)

    _extractCollectionArray: (source) ->
      return {} if _.isEmpty(source)
      action = @$context.collection_action('query')
      @_extractArrayValues(action, source)

    _extractCollection: (source) ->
      action = @$context.collection_action('query')
      @_extractValues(action, source)

    _extractMember: (source) ->
      action = @$context.member_action('get')
      @_extractValues(action, source)

    _extractArrayValues: (action, objects) ->
      mappings  = action.mappings

      values = _.map objects, (obj) => @_extractValues(action, obj)
      values = _.compact(values)

      result = {}
      _.each mappings, (mapping) ->
        result[mapping.source] = []

        _.each values, (attrs) ->
          return unless attrs[mapping.source]
          result[mapping.source].push attrs[mapping.source]

      result

    _extractValues: (action, object) ->
      id = object && object['@id']
      return {} unless id

      result    = {}
      template  = new UriTemplate(action.template)
      values    = template.fromUri(id)
      return {} if _.isEmpty(values)

      mappings  = action.mappings

      _.each mappings, (mapping) ->
        value = values[mapping.variable]
        return unless value

        result[mapping.source] = value

      result
