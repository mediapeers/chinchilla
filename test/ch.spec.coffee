'use strict'

describe '$chProvider', ->
  $ch = null
  $chTimestampedUrl = null
  $httpBackend = null
  ChContext = null
  ChContextOperation = null
  EP = 'http://pm.mpx.dev/v20140601/context/entry_point?t=0'
  PC = 'http://pm.mpx.dev/v20140601/context/product?t=0'

  beforeEach ->
    angular.mock.module("chinchilla")
    sinon.useFakeTimers()

  beforeEach ->
    angular.mock.module ($chProvider) ->
      $chProvider.setEndpoint('pm', EP)
      null

  describe '$ch', ->
    beforeEach ->
      inject ($injector) ->
        $ch = $injector.get('$ch')
        $httpBackend = $injector.get('$httpBackend')
        ChContext = $injector.get('ChContext')
        ChContextOperation = $injector.get('ChContextOperation')

        $httpBackend.whenGET(EP).respond({})

    it 'returns context operation for system id', ->
      expect($ch('pm')).to.be.an.instanceof(ChContextOperation)

    it 'returns context operation for object', ->
      obj = '@context': 'http://pm.mpx.dev/v20140601/context/affiliation'
      expect($ch(obj)).to.be.an.instanceof(ChContextOperation)

    it 'fetches context for pm entry point', ->
      operation = $ch('pm')
      $httpBackend.flush()

    it 'fetches context for product', ->
      $httpBackend.expectGET(PC).respond({})
      obj = '@context': 'http://pm.mpx.dev/v20140601/context/product'

      operation = $ch(obj)
      $httpBackend.flush()

  describe '$chTimestampedUrl', ->
    beforeEach ->
      inject ($injector) ->
        $chTimestampedUrl = $injector.get('$chTimestampedUrl')

    it 'adds timestamp to clean url withouth params', ->
      url = "http://google.com"
      timestamped = $chTimestampedUrl(url)
      expect(_.contains(timestamped, "?t=")).to.be.true

    it 'adds timestamp to already parametrized url', ->
      url = "http://google.com?foo=bar"
      timestamped = $chTimestampedUrl(url)
      expect(_.contains(timestamped, "&t=")).to.be.true
