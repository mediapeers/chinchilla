module = angular.module('chinchilla', [])

module.provider '$ch', () ->
  # holds the urls to different application entry point contexts
  entryPoints = {}

  @setEntryPoint = (systemId, url) ->
    entryPoints[systemId] = url

  @.$get = ['ChContextOp', (ChContextOp) ->
    (systemId) ->
      contextUrl = entryPoints[systemId]
      throw new Error("no entry point url defined for #{systemId}") unless contextUrl

      new ChContextOp(null, { __context__: contextUrl })
  ]

  @
