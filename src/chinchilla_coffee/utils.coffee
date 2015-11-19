angular.module('chinchilla').factory 'ChUtils', ->
  class ChUtils
    @extractValues: (action, object) ->
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

    @extractArrayValues: (action, objects) ->
      mappings  = action.mappings

      values = _.map objects, (obj) -> ChUtils.extractValues(action, obj)
      values = _.compact(values)

      result = {}
      _.each mappings, (mapping) ->
        result[mapping.source] = []

        _.each values, (attrs) ->
          return unless attrs[mapping.source]
          return if _.include result[mapping.source], attrs[mapping.source]
          result[mapping.source].push attrs[mapping.source]

      result
