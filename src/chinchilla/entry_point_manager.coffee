angular.module('chinchilla').factory 'ch_EntryPointManager', (ch_EntryPoint, $q) ->
  EntryPoint = ch_EntryPoint

  class EntryPointManager
    constructor: (definitions) ->
      @entryPoints = _.clone(definitions)
      @allNames = _.keys(definitions)

      _.each @entryPoints, (v, k) =>
        @entryPoints[k] = new EntryPoint(v, k)

    resolve: (name) ->
      names = @_prepareNames(name)
      promises = _.map names, (name) => @entryPoints[name].resolve().promise
      $q.all(promises)

    invoked: (name) ->
      names = @_prepareNames(name)
      _.every names, (name) => @entryPoints[name].invoked

    ready: (name) ->
      names = @_prepareNames(name)
      _.every names, (name) => @entryPoints[name].ready

    failed: (name) ->
      names = @_prepareNames(name)
      _.some names, (name) => @entryPoints[name].failed

    finished: (name) ->
      names = @_prepareNames(name)
      _.every names, (name) => @entryPoints[name].finished

    select: (name) ->
      names = @_prepareNames(name)
      _.pick @entryPoints, names

    _prepareNames: (name) ->
      names = null
      that = @

      if name
        if _.isArray(name)
          if _.isEmpty(name)
            names = @allNames
          else
            names = name
        else
          names = [name]

        _.each names, (name) ->
          unless _.has(that.entryPoints, name)
            throw Error("Can not resolve entry point #{name}")

      else
        names = @allNames

      names





