angular.module('chinchilla').factory 'ch_ContextManager', (ch_Context, ch_Tools, $q) ->
  Context = ch_Context
  Tools = ch_Tools

  class ContextManager
    constructor: () ->
      @namespaceIndex = {}
      @nameIndex = {}
      @complexIndex = {}
      @contexts = []

    register: (appName, definition) ->
      return if @complexIndex[appName][definition.name] # skip if already added

      namespace = appName
      name = definition.name
      url = definition.url
      options = _.omit(definition, ['name', 'url'])

      context = new Context(namespace, name, url, options)
      @contexts.push(context)

      @namespaceIndex[namespace] ?= []
      @namespaceIndex.push(context)

      @nameIndex[name] ?= []
      @nameIndex[name].push(context)

      @complexIndex[namespace] ?= {}
      @complexIndex[namespace][name] = context

    resolve: (namespace, name) ->
      namespaces = Tools.toMultiarg(namespace, /.*/)
      names = Tools.toMultiarg(name, /.*/)

      promises = _.inject @contexts, (_promises, context) ->
        if Tools.multiMatch(context.namespace, namespaces) && Tools.multiMatch(context.name, names)
          _promises.push(context.resolve().promise)
      , []

      $q.all(promises)


    findAction: (namespace, name, actionName, allowCollection, allowMember) ->
      namespaces = Tools.toMultiarg(namespace, /.*/)

      if allowCollection && allowMember
        @_findAnyAction(namespaces, name, actionName) ->
      else if allowCollection
        @_findCollectionAction(namespaces, name, actionName)
      else if allowMember
        @_findMemberAction(namespaces, name, actionName)
      else
        throw Error("Unknown ContextManager#action type #{name}->#{actionName}")


    _findAnyAction: (namespace, name, actionName) ->
      found = null
      _.each @nameIndex[name], (context) ->
        if Tools.multiMatch(context.namespace, namespaces)
          _found = context.findAnyAction(actionName)
          if _found
            found = _found
            return
      found


    _findCollectionAction: (namespace, name, actionName) ->
      found = null
      _.each @nameIndex[name], (context) ->
        if Tools.multiMatch(context.namespace, namespaces)
          _found = context.findCollectionAction(actionName)
          if _found
            found = _found
            return
      found


    _findMemberAction: (namespace, name, actionName) ->
      found = null
      _.each @nameIndex[name], (context) ->
        if Tools.multiMatch(context.namespace, namespaces)
          _found = context.findMemberAction(actionName)
          if _found
            found = _found
            return
      found
