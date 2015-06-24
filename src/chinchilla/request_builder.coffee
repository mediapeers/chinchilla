angular.module('chinchilla').factory 'ChRequestBuilder', ($q, $injector, $http, $chTimestampedUrl, ChUtils) ->
  # class to build and run requests. uses template to extract needed params from existing
  # objects and to build request url.
  class ChRequestBuilder
    # @param [ChContext] $context
    # @param [Object|Array<Object>] subject concrete objects to run request for
    # @param [String] type 'member' or 'collection'
    # @param [String] action e.g. 'query'
    # @param [String] options e.g. {raw: true}
    constructor: (@$context, @$subject, @$type, @$actionName, @$options) ->
      @$mergedParams = {}
      @$action = if @$type == 'collection'
        @$context.collection_action(@$actionName)
      else
        @$context.member_action(@$actionName)

    # extracts params from object(s).
    #
    # source is object     => output e.g. { id: 2, name: 'foo' }
    # source is array      => output e.g. { id: [1, 2], name: ['foo', 'bar']}
    extractFrom: (source, type) ->
      params = if _.isArray(source) && type == 'member'
        @_extractMemberArray(source)

      else if _.isArray(source) && type == 'collection'
        first = _.first(source)
        if _.has(first, '@context')
          @_extractMemberArray(source)
        else
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
      data = if _.include(['POST', 'PUT', 'PATCH'], @$action.method)
        @data()
      else
        null

      $http(
        method: @$action.method
        url: $chTimestampedUrl(@buildUrl())
        data: data
      )

    # builds the url with all previously collected params.
    #
    # @param [Object] action action from context
    buildUrl: ->
      uriTmpl = new UriTemplate(@$action.template)
      uriTmpl.fillFromObject(@_buildParams())

    # builds body data. if $subject is an array of objects a nested data object is created
    # containing each object's data, referenced by object id
    data: ->
      if @$options['raw']
        @_cleanup(@$subject)

      else if _.isArray(@$subject)
        data = {}
        _.each @$subject, (obj) =>
          data[obj.id] = @_remapAttributes(@_cleanup(obj))
        data

      else
        @_cleanup(@_remapAttributes(@$subject))

    # cleans the object to be send
    # * rejects attributes starting with $
    # * rejects validation errors and isPristine attribute
    # * rejects js functions
    # * rejects empty objects {}
    # * rejects empty objects within array [{}]
    _cleanup: (object) ->
      self = @
      newObject = {}

      _.each object, (v,k) ->
        if /^\$/.test(k) || k == 'errors' || k == 'isPristine' || _.isFunction(v)
          # skip
        else if _.isArray(v)
          if _.isPlainObject(v[0])
            subset = _.map v, (x) -> self._cleanup(x)
            newObject[k] = _.reject subset, (x) -> _.isEmpty(x)

          else
            newObject[k] = v

        else if _.isPlainObject(v)
          obj = self._cleanup(v)
          newObject[k] = obj unless _.isEmpty(obj)

        else
          newObject[k] = v

      newObject

    _remapAttributes: (object) ->
      self = @
      _.each object, (value, key) ->
        # split csv string to array
        if _.isString(value) && /(^tags|_ids$)/.test(key)
          values = _.select value.split(','), (item) -> !_.isEmpty(item)
          object[key] = values

        # remap nested data according to rails conventions
        else if _.isObject(value)
          object["#{key}_attributes"] = value
          delete object[key]


    # builds params using action template from context
    #
    # @param [Object] action action from context
    _buildParams: ->
      mappings  = @$action.mappings
      result    = {}

      _.each mappings, (mapping) =>
        value = @$mergedParams[mapping.source] || @$mergedParams[mapping.variable]
        return unless value
        result[mapping.variable] = value

      result

    _extractMemberArray: (source) ->
      action = @$context.member_action('get')
      return {} if _.isEmpty(source) || _.isEmpty(action)
      ChUtils.extractArrayValues(action, source)

    _extractCollectionArray: (source) ->
      action = @$context.collection_action('query')
      return {} if _.isEmpty(source) || _.isEmpty(action)
      ChUtils.extractArrayValues(action, source)

    _extractCollection: (source) ->
      action = @$context.collection_action('query')
      return {} if _.isEmpty(source) || _.isEmpty(action)
      ChUtils.extractValues(action, source)

    _extractMember: (source) ->
      action = @$context.member_action('get')
      return {} if _.isEmpty(source) || _.isEmpty(action)
      ChUtils.extractValues(action, source)
