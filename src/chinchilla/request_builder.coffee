angular.module('chinchilla').factory 'ChRequestBuilder', ($q, $injector, $http) ->
  class ChRequestBuilder
    constructor: (@$context, @$subject, @$type, @$action) ->
      @$mergedParams = {}

    extractFrom: (source, type) ->
      # source is object, association type is member       => use member template
      # source is object, association type is collection   => use collection template
      # source is array, type is collection                => use member template (HABTM)
      # source is array, type is member                    => DOES NOT MAKE SENSE
      #
      # source is object     => output e.g. { id: 2, name: 'foo' }
      # source is array      => output e.g. { id: [1, 2], name: ['foo', 'bar']}
      params = if _.isArray(source) && type == 'collection'
        @_extractMemberArray(source)
      else
        if type == 'collection'
          @_extractCollection(source)
        else
          @_extractMember(source)

      @mergeParams(params)
      params

    mergeParams: (params) ->
      _.merge @$mergedParams, params || {}

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

    buildUrl: (action) ->
      uriTmpl = new UriTemplate(action.template)
      uriTmpl.fillFromObject(@_buildParams(action))

    data: ->
      if @$type == 'collection'
        result = {}
        _.each @$subject, (obj) -> result[obj.id] = obj
        result
      else
        @$subject

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
      mappings  = action.mappings

      values = _.map source, (obj) => @_extractValues(action, obj)

      result = {}
      _.each mappings, (mapping) ->
        result[mapping.source] = []

        _.each values, (attrs) ->
          return unless attrs[mapping.source]
          result[mapping.source].push attrs[mapping.source]

      result

    _extractCollection: (source) ->
      action = @$context.collection_action('query')
      @_extractValues(action, source)

    _extractMember: (source) ->
      action = @$context.member_action('get')
      @_extractValues(action, source)

    _extractValues: (action, object) ->
      id = object && object['@id']
      return {} unless id

      result    = {}
      template  = new UriTemplate(action.template)
      values    = template.fromUri(id)
      mappings  = action.mappings

      _.each mappings, (mapping) ->
        value = values[mapping.variable]
        return unless value

        result[mapping.source] = value

      result
