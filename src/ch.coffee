module = angular.module('chinchilla', [])

module.provider '$ch', () ->
  provider = @

  @options =
    entryPoints: {}

  @entryPointManager = null
  @contextManager = null

  @setEntryPoint = (name, url) ->
    @options.entryPoints[name] = url

  @.$get = ['ch_Chinchilla', 'ch_EntryPointManager', 'ch_ContextManager', (ch_Chinchilla, ch_EntryPointManager, ch_ContextManager) ->
    provider.entryPointManager = new ch_EntryPointManager(provider.options.entryPoints)
    provider.contextManager = new ch_ContextManager()

    (args...) ->
      options =
        entryPointManager: provider.entryPointManager
        contextManager: provider.entryPointManager

      [arg1, arg2, arg3] = args

      switch args.length
        when 0 then return new ch_Chinchilla(options)
        when 1 then return new ch_Chinchilla(arg1, options)
        when 2 then return new ch_Chinchilla(arg1, arg2, options)
        when 3 then return new ch_Chinchilla(arg1, arg2, arg3, options)
        else throw Error("Wrong number of args (#{args.length}) for $ch")
  ]

  return provider
