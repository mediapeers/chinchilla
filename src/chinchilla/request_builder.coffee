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

    buildUrl:
      -> throw new Error('ChRequestBuilder#buildUrl: abstract! should be implemented in concrete class')

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
      uriAttrs  = template.fromUri(@$subject['@id'])

      # transform using mapping
      result = {}
      _.each mappings, (mapping) ->
        value = uriAttrs[mapping.variable]
        return unless value

        result[mapping.source] = value

      result

    buildUrl: ->
      uriTmpl = new UriTemplate(@$contextAction.template)

      # convert attrs using mapping
      uriAttrs = {}
      _.each @$contextAction.mappings, (mapping) =>
        value = @$subject && @$subject[mapping.source]
        return unless value

        uriAttrs[mapping.variable] = value

      uriTmpl.fillFromObject(uriAttrs)

    data: ->
      @$subject || {}


angular.module('chinchilla').factory 'ChCollectionRequestBuilder', ($q, ChRequestBuilder) ->
  class ChCollectionRequestBuilder extends ChRequestBuilder
    constructor: ->
      super
      @$contextAction = @$context.collection_action(@$action)

    extractAttributes: ->
      unless _.isArray(@$subject)
        throw new Error("ChCollectionRequestBuilder#extractAttributes: 'subject' must be an array")

      return {} if _.isEmpty(@$subject)

      get       = @$context.member_action('get')
      template  = new UriTemplate(get.template)
      mappings  = get.mappings
      uriAttrs  = _.map @$subject, (obj) -> template.fromUri(obj['@id'])

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

    buildUrl: ->
      uriTmpl       = new UriTemplate(@$contextAction.template)

      # convert attrs using mapping
      uriAttrs = {}
      _.each @$contextAction.mappings, (mapping) =>
        return unless @$subject

        uriAttrs[mapping.variable] ||= []

        _.each @$subject, (obj) ->
          value = obj[mapping.source]
          return unless value

          uriAttrs[mapping.variable].push(value)

      uriTmpl.fillFromObject(uriAttrs)

    data: ->
      result = {}
      _.each @$subject, (obj) ->
        result[obj.id] = obj

      result
