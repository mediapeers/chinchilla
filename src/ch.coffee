module = angular.module('chinchilla', [])

module.provider '$ch', () ->
  # holds the urls to different application entry point contexts
  entryPoints = {}

  @setEntryPoint = (systemId, url) ->
    entryPoints[systemId] = url

  @.$get = ['ChContextOperation', 'ChObjectsOperation', (ChContextOperation, ChObjectsOperation) ->
    fn = (subject) ->
      if _.isString(subject)
        contextUrl = entryPoints[subject]
        throw new Error("no entry point url defined for #{subject}") unless contextUrl

        new ChContextOperation(null, { '@context': contextUrl })
      else
        new ChContextOperation(null, subject)

    fn.o = (objects) -> new ChObjectsOperation(objects)
    fn.c = (objects) -> new ChContextOperation(objects)
    fn
  ]

  @

# helper utility to append a timestamp to a given url
module.provider '$chTimestampedUrl', () ->
  @timestamp = new Date().getTime()

  @.$get = =>
    (url) =>
      uri = new URI(url)
      uri.addQuery(t: @timestamp)
      uri.toString()

  @
