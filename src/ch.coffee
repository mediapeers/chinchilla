module = angular.module('chinchilla', ['ngCookies'])

module.provider '$ch', () ->
  # holds the urls to different application entry point contexts
  endpoints = {}

  @setEndpoint = (systemId, url) ->
    endpoints[systemId] = url

  @.$get = ['ChContextOperation', 'ChObjectsOperation', (ChContextOperation, ChObjectsOperation) ->
    fn = (subject) ->
      if _.isString(subject)
        endpoint = endpoints[subject]
        throw new Error("no endpoint url defined for #{subject}") unless endpoint
        new ChContextOperation(null, { '@context': "#{endpoint}/context/entry_point" })
      else
        new ChContextOperation(null, subject)

    fn.o = (objects) -> new ChObjectsOperation(objects)

    fn.c = ->
      if arguments.length == 2
        [system, model] = arguments
        endpoint = endpoints[system]
        throw new Error("no endpoint url defined for #{system}") unless endpoint
        new ChContextOperation(null, { '@context': "#{endpoint}/context/#{model}" })
      else
        contextUrl = arguments[0]
        new ChContextOperation(null, contextUrl)

    fn
  ]

  @

# helper utility to append a timestamp to a given url
module.provider '$chTimestampedUrl', () ->
  timestamp = new Date().getTime()

  @.$get = ->
    (url) ->
      uri = new URI(url)
      uri.addQuery(t: timestamp)
      uri.toString()

  @

# helper utility to manage session
module.provider '$chSession', () ->
  domain  = null
  opts    = null

  @.$get = ['$cookies', '$location', ($cookies, $location) ->
    cookieKey: 'chSessionId'

    domain: ->
      domain ||= $location.host().split('.').slice(-2).join('.')

    cookieOpts: ->
      opts ||=
        path: '/'
        domain: @domain()
        expires: moment().add(1, 'year').toISOString()

    setSessionDomain: (domainName) ->
      domain = domainName

    setSessionId: (id) ->
      $cookies.put(@cookieKey, id, @cookieOpts())
      id

    getSessionId: ->
      $cookies.get(@cookieKey)

    clearSessionId: ->
      $cookies.remove(@cookieKey, domain: @domain())
  ]

  @
