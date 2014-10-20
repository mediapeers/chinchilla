# collection
# 1. dissasemble attributes from get template for each object
# 2. assemble new url params by merging
# 2. assemble new collection url
# 3. apply params (if passed)
# 4. attach data for POST and PUT for each object, key is id always
#
# member
# 1. dissasemble attributes from get template for object
# 2. assemble new member url
# 3. apply params (if passed)
# 4. attach data for POST and PUT
#
# explicit
# 1. assemble new url with passed params


angular.module('chinchilla').factory 'ChRequestBuilder', ($q, $injector, $http) ->
  class ChRequestBuilder
    @init = (context, subject, type, action) ->
      klass = switch type
        when 'member' then $injector.get('ChMemberRequestBuilder')
        when 'collection' then $injector.get('ChCollectionRequestBuilder')

      new klass(context, subject, type, action)

    constructor: (@$context, @$subject, @$type, @$action, @$params) ->

    extractAttributes:
      -> throw new Error('ChRequestBuilder#extractAttributes: abstract! should be implemented in concrete class')

    mappings:
      -> throw new Error('ChRequestBuilder#mappings: abstract! should be implemented in concrete class')

    buildUriParams:
      -> throw new Error('ChRequestBuilder#buildUriParams: abstract! should be implemented in concrete class')

    data:
      -> throw new Error('ChRequestBuilder#data: abstract! should be implemented in concrete class')

    performRequest: ->
      data = if _.include(['POST', 'PUT', 'PATCH'], @$contextAction.method)
        @data()
      else
        null

      $http(
        method: @$contextAction.method
        url: @buildUrl()
        params: @$params
        data: data
      )

    buildUrl: ->
      uriTmpl = new UriTemplate(@$contextAction.template)
      uriTmpl.fillFromObject(@buildUriParams())

    getId: (obj) ->
      return obj['@id'] if obj && obj['@id']

      get       = @$context.member_action('get')
      template  = new UriTemplate(get.template)
      params    = {}

      _.each get.mappings, (mapping) ->
        value = obj[mapping.source]
        return unless value

        params[mapping.variable] = value

      template.fillFromObject(params)

angular.module('chinchilla').factory 'ChMemberRequestBuilder', ($q, ChRequestBuilder) ->
  class ChMemberRequestBuilder extends ChRequestBuilder
    constructor: ->
      super
      @$contextAction = @$context.member_action(@$action)

    extractAttributes: ->
      return {} unless @$subject

      get       = @$context.member_action('get')
      template  = new UriTemplate(get.template)
      mappings  = get.mappings
      uriAttrs  = template.fromUri(@getId(@$subject))

      # transform using mapping
      result = {}
      _.each mappings, (mapping) ->
        value = uriAttrs[mapping.variable]
        return unless value

        result[mapping.source] = value

      result

    # extracts attributes first, then tries to find values from object
    buildUriParams: ->
      params = {}
      attrs  = @extractAttributes()

      _.each @$contextAction.mappings, (mapping) =>
        value = attrs[mapping.source] || (@$subject && @$subject[mapping.source])
        return unless value

        params[mapping.variable] = value

      params

    data: ->
      @$subject || {}


angular.module('chinchilla').factory 'ChCollectionRequestBuilder', ($q, ChRequestBuilder) ->
  class ChCollectionRequestBuilder extends ChRequestBuilder
    constructor: ->
      super
      @$contextAction = @$context.collection_action(@$action)

    extractAttributes: ->
      return {} if _.isEmpty(@$subject)

      get       = @$context.member_action('get')
      template  = new UriTemplate(get.template)
      mappings  = get.mappings
      uriAttrs  = _.map @$subject, (obj) => template.fromUri(@getId(obj))

      # transform using mapping
      result = {}
      _.each mappings, (mapping) ->
        result[mapping.source] ||= []

        _.each uriAttrs, (attrs) ->
          value = attrs[mapping.variable]
          return unless value

          result[mapping.source].push(value)

        result[mapping.source] = result[mapping.source]

      result

    buildUriParams: ->
      params = {}
      attrs  = @extractAttributes()

      _.each @$contextAction.mappings, (mapping) =>
        return unless @$subject

        if attrs[mapping.source]
          params[mapping.variable] = attrs[mapping.source]
        else
          params[mapping.variable] ||= []

          _.each @$subject, (obj) ->
            value = obj[mapping.source]
            return unless value

            params[mapping.variable].push(value)

      params

    data: ->
      result = {}
      _.each @$subject, (obj) ->
        result[obj.id] = obj

      result
