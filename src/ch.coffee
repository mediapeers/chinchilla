module = angular.module('chinchilla', [])

module.provider '$ch', () ->
  # holds the urls to different application entry point contexts
  entryPoints = {}

  @setEntryPoint = (systemId, url) ->
    entryPoints[systemId] = url

  @.$get = ['ChContextOperation', (ChContextOperation) ->
    (subject) ->
      if _.isString(subject)
        contextUrl = entryPoints[subject]
        throw new Error("no entry point url defined for #{subject}") unless contextUrl

        new ChContextOperation(null, { '@context': contextUrl })
      else
        new ChContextOperation(null, subject)
  ]

  @
