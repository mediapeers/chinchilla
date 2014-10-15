angular.module('chinchilla').factory 'ch_Chinchilla', ($q, $http) ->
  DEFAULT_CHINCHILLA_OPTIONS =
    appName: null
    entryPointManager: null
    uri: null
    type: null
    anonymous: true
    collection: false

  class Chinchilla
    constructor: (args..., opts) ->
      @invocationChain = []
      @options = _.extend(DEFAULT_CHINCHILLA_OPTIONS, opts)
      @data = null

      switch args.length
        when 0 then @_constructor_0()
        when 1 then @_constructor_1(args[0])
        when 2 then @_constructor_2(args[0], args[1])
        else throw Error("Wrong number of args (#{args.length}) for Chinchilla#constructor")

    _constructor_0: () ->
      # no args, global behaviour

    _constructor_1: (arg) ->
      if _.isObject(arg)
        if _.isNull(arg)
          throw Error("Chinchilla#_constructor_1; Object argument is null")

        else if _.isArray(arg)
          # do something good with array
          true

        else if !arg['__id__']? || !arg['__type__']?
          throw Error("Chinchilla#_constructor_1; Object argument is in unknown format")

        else
          @options.uri = arg.__id__
          @options.type = arg.__type__
          @data = arg

          @_invoke 'getEntryPoint'
          @_invoke 'getContext'

      else if _.isString(arg)
        if _.isEmpty(arg)
          throw Error("Chinchilla#_constructor_1; String argument is empty")

        else if /^https?\:\/\//i.test arg
          @options.uri = arg

          @_invoke 'loadUri'
          @_invoke 'getEntryPoint'
          @_invoke 'getContext'

        else
          @options.type = arg

          @_invoke 'getEntryPoint'
          @_invoke 'getContext'

      else # ex. undefined
        throw Error("Chinchilla#_constructor_1; Argument is undefined")


    _constructor_2: (arg1, arg2) ->
      if !_.isString(arg1) || _.isEmpty(arg1)
        throw Error("Chinchilla#_constructor_2; Module argument is empty or not a string")

      @options.appName = arg1

      @_constructor_1(arg2)

    # public methods

    $do: (action, params) ->
      @_invoke 'invokeRemote', action, params
      @

    $new: () ->
      @_invoke 'invokeLocal', '_new'
      @

    $dup: () ->
      @_invoke 'invokeLocal', '_dup'
      @

    # invoker & executor
    _invoke: (name, args...) ->
      name = "___#{name}"
      throw Error("Unknown invocation #{name} in Chinchilla#invoke") unless _.isFunction(@[name])
      @invocationChain.push({name: name, args: args, invoked: false, succeded: false, errored: false})
      @

    _exec: ->
      # blah blah, find effective way for right step execution

      # step = _.inject @invocationChain, (element, acc) ->
      #   throw new Error("Trying to execute broken invocation chain (#{element.name})") if element.errored

      #   if !element.invoked


      #   acc.prev = x
      # , { prev: null, found: null }

      # @_execStep(step.found) if step.found

    _execStep: (element) ->
      return if element.invoked
      element.invoked = true

      retValue = that[element.name].apply(element.args)
      switch retValue
        when 'ready'
          element.succeded = true
          @_exec()

        when 'failed'
          # TODO: map errors
          element.errored = true

        when 'invoked'
          false # do noithing, just wait

        else # got a promise
          retValue.then (success) =>
            element.succeded = true
            @_exec()
          , (err) ->
            # TODO: map errors
            element.errored = true

      _.each @invocationChain, (element) ->








    # private
    _new: ->
      # creates minimal prototype

    _dup: ->
      # creates duplicate

    # invocation methods

    ___getEntryPoint: ->
      entryPointManager = @options.entryPointManager
      contextManager = @options.contextManager
      appName = @options.appName

      return 'ready' if entryPointManager.ready(appName)
      return 'failed' if entryPointManager.failed(appName)
      return 'invoked' if entryPointManager.invoked(appName)

      promise = entryPointManager.resolve(appName)

      promise.then () ->
        _.each entryPointManager.select(appName), (entryPoint) ->
          _.each entryPoint.contexts(), (context) ->
            contextManager.register(appName, context)

      promise

    ___getContext: ->
      @options.contextManager.resolve(@options.appName, @options.type)

    ___loadUri: ->
      that = @
      deferred = $q.defer
      $http.get(url: @options.uri).then (data) ->
        that.data = data.data
        deferred.resolve()
      , (error) ->
        deferred.reject(data: data, status: status)

      deferred.promise

    ___invokeRemote: (name, params) ->
      that = @
      deferred = $q.defer()

      action = @options.contextManager.get(@options.type).findAction(name, @options.anonymous, @options.collection)
      throw Error("Unknown action #{name} for #{@options.type}")
      httpOptions = action.prepare(params)
      request = $http.get(httpOptions)

      request.then (data) ->
        deferred.resolve()
      , (error) ->
        deferred.reject(data: data, status: status)

    ___invokeLocal: (name, params) ->
      @[name](params)

