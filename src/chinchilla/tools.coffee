angular.module('chinchilla').factory 'ch_ContextManager', (ch_Tools) ->

  toMultiarg = (arg, defaults) ->
    args = null

    if arg
      if _.isArray(arg)
        if _.isEmpty(arg)
          args = defaults
        else
          args = arg
      else
        args = [arg]

    else
      args = defaults

    args

  multiMatch = (value, matcher) ->
    if _.isRegExp(matcher)
      matcher.test(value)

    if _.isArray(matcher)
      !!_.detect(matcher, value)

    else
      false

  toMultiarg: toMultiarg
  multiMatch: multiMatch




