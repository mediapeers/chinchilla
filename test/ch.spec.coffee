'use strict'

describe '$chProvider', ->
  $ch = null
  $httpBackend = null
  ChContext = null
  ChContextOp = null
  EP = 'http://pm.mpx.dev/v20140601/context/entry_point'

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
        ChContextOp = $injector.get('ChContextOp')

        entryPointContext = loadFixture('pm.context.entry_point')
        $httpBackend.whenGET(EP).respond(entryPointContext)

    it 'returns context operation', ->
      expect($ch('pm')).to.be.an.instanceof(ChContextOp)

    it 'fetches context for pm entry point', ->
      operation = $ch('pm')

      expect(operation.$context).to.be.null

      $httpBackend.flush()

      expect(operation.$context).not.to.be.null
      expect(operation.$context).to.be.an.instanceof(ChContext)

