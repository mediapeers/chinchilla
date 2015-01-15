'use strict'

describe 'ChContextOperation', ->
  $ch = null
  $httpBackend = null
  ChContext = null
  ChContextOperation = null
  $pm = null
  EP = 'http://pm.mpx.dev/v20140601/context/entry_point?t=0'
  PC = 'http://pm.mpx.dev/v20140601/context/product?t=0'
  AC = 'http://pm.mpx.dev/v20140601/context/affiliation?t=0'

  beforeEach ->
    angular.mock.module("chinchilla")
    sinon.useFakeTimers()

  beforeEach ->
    angular.mock.module ($chProvider) ->
      $chProvider.setEndpoint('pm', EP)
      null

  afterEach ->
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()

  beforeEach ->
    inject ($injector) ->
      $ch = $injector.get('$ch')
      $httpBackend = $injector.get('$httpBackend')
      ChContext = $injector.get('ChContext')
      ChContextOperation = $injector.get('ChContextOperation')

      entryPointContext = loadFixture('pm.context.entry_point')
      productContext = loadFixture('pm.context.product')
      affiliationContext = loadFixture('pm.context.affiliation')
      $httpBackend.whenGET(AC).respond(affiliationContext)
      $httpBackend.whenGET(EP).respond(entryPointContext)
      $httpBackend.whenGET(PC).respond(productContext)

      $pm = $ch('pm')
      $httpBackend.flush()

  it 'requests the context for product', ->
    operation = $pm.$('products')
    $httpBackend.flush()

  describe '#$new', ->
    it 'creates new empty object', ->
      operation = $pm.$('products')
      $httpBackend.flush()

      operation.$new(foo: 'bar').$promise.then (result) ->
        expect(result.$obj).to.be.like('@context': 'http://pm.mpx.dev/v20140601/context/product', foo: 'bar')

      true

  it 'responds to $$', ->
    expect($pm).to.respondTo('$$')

  context 'association data', ->
    it 'exposes association data for collection', ->
      $httpBackend.expectGET('http://pm.mpx.dev/v20140601/products?t=0').respond(members: [{ '@context': PC, affiliation: { '@id': 'foo' }}])
      products = $pm.$('products').$$('query')
      affiliationContext = products.$('affiliation')
      $httpBackend.flush()

      expect(affiliationContext.$associationData.length).to.eq(1)
      expect(affiliationContext.$associationData[0]).to.be.like('@id': 'foo')

    it 'exposes association data for has one/belongs to association', ->
      $httpBackend.expectGET('http://pm.mpx.dev/v20140601/product/1?t=0').respond('@context': PC, affiliation: { '@id': 'foo' })
      products = $pm.$('products').$m('get', id: 1)
      affiliationContext = products.$('affiliation')
      $httpBackend.flush()

      expect(affiliationContext.$associationData).to.be.like('@id': 'foo')
