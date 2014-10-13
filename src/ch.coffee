module = angular.module('chinchilla', [])

module.provider '$ch', () ->
  provider = @

  @.defaults = {}
  @.endpoints = {}

  @.setEndpoint = (moduleName, url) ->
    console.log('Setting endpoint')

    provider.endpoints[moduleName] = url

  @.$get = ['ch_Chinchilla', (ch_Chinchilla) ->
    (definition) -> new ch_Chinchilla(definition, provider)
  ]

  return provider
