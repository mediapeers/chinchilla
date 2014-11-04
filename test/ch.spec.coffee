'use strict'

describe '$chProvider', ->
  $ch = null
  $httpBackend = null
  ChContext = null
  ChContextOperation = null
  EP = 'http://pm.mpx.dev/v20140601/context/entry_point'
  PC = 'http://pm.mpx.dev/v20140601/context/product'

  beforeEach ->
    angular.mock.module("chinchilla")

  beforeEach ->
    angular.mock.module ($chProvider) ->
      $chProvider.setEntryPoint('pm', EP)
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
