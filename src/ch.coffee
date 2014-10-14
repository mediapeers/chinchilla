module = angular.module('chinchilla', [])

module.provider '$ch', () ->
  provider = @

  @.defaults = {}
  @.endpoints = {}

  @.setEndpoint = (moduleName, url) ->
    console.log('Setting endpoint')

    provider.endpoints[moduleName] = url

  @.$get = ['ch_Chinchilla', (ch_Chinchilla, ch_EntryPointRegistry, ch_ContextRegistry) ->
    provider.contextEntryPointRegistry = new ch_EntryPointRegistry(provider.endpoints)
    provider.contextRegistry = new ch_ContextRegistry()

    (definition) -> new ch_Chinchilla(definition, provider)
  ]

  return provider
