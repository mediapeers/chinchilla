'use strict'

describe 'ChActionOp', ->
  $ch = null
  $httpBackend = null
  ChActionOp = null
  $pm = null
  EP = 'http://pm.mpx.dev/v20140601/context/entry_point'
  PC = 'http://pm.mpx.dev/v20140601/context/product'
  AC = 'http://pm.mpx.dev/v20140601/context/affiliation'

  beforeEach ->
    angular.mock.module("chinchilla")

  beforeEach ->
    angular.mock.module ($chProvider) ->
      $chProvider.setEntryPoint('pm', EP)
      null

  afterEach ->
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()

  describe '$ch', ->
    beforeEach ->
      inject ($injector) ->
        $ch = $injector.get('$ch')
        $httpBackend = $injector.get('$httpBackend')
        ChActionOp = $injector.get('ChActionOp')

        entryPointContext = loadFixture('pm.context.entry_point')
        productContext = loadFixture('pm.context.product')

        $httpBackend.whenGET(EP).respond(entryPointContext)
        $httpBackend.whenGET(PC).respond(productContext)
        $httpBackend.whenGET(AC).respond({})

        $pm = $ch('pm')

    it 'gets an action operation', ->
      operation = $pm.$('products').$$('query')

      $httpBackend.flush()
      expect(operation).to.be.an.instanceof(ChActionOp)

    it 'initializes collection action', ->
      operation = $pm.$('products').$c('query')

      $httpBackend.flush()
      expect(operation.$type).to.eq('collection')

    it 'initializes member action', ->
      operation = $pm.$('products').$m('get')

      $httpBackend.flush()
      expect(operation.$type).to.eq('member')

    it 'initializes collection action by default for collection has_many/HABTM association', ->
      operation = $pm.$('products').$$('query')

      $httpBackend.flush()
      expect(operation.$type).to.eq('collection')

    it 'initializes member action by default for has_one/belongs_to association', ->
      operation = $pm.$('affiliation').$$('get')

      $httpBackend.flush()
      expect(operation.$type).to.eq('member')
