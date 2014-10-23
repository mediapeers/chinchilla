'use strict'

describe 'ChContextOp', ->
  $ch = null
  $httpBackend = null
  ChContext = null
  ChContextOp = null
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

  beforeEach ->
    inject ($injector) ->
      $ch = $injector.get('$ch')
      $httpBackend = $injector.get('$httpBackend')
      ChContext = $injector.get('ChContext')
      ChContextOp = $injector.get('ChContextOp')

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

  it 'responds to $$', ->
    expect($pm).to.respondTo('$$')

  context 'association data', ->
    it 'exposes association data for collection', ->
      $httpBackend.expectGET('http://pm.mpx.dev/v20140601/products').respond(members: [{ affiliation: { '@id': 'foo' }}])
      products = $pm.$('products').$$('query')
      affiliationContext = products.$('affiliation')
      $httpBackend.flush()

      expect(affiliationContext.$associationData.length).to.eq(1)
      expect(affiliationContext.$associationData[0]).to.be.like('@id': 'foo')

    it 'exposes association data for has one/belongs to association', ->
      $httpBackend.expectGET('http://pm.mpx.dev/v20140601/products').respond(affiliation: { '@id': 'foo' })
      products = $pm.$('products').$$('query')
      affiliationContext = products.$('affiliation')
      $httpBackend.flush()

      expect(affiliationContext.$associationData).to.be.like('@id': 'foo')
