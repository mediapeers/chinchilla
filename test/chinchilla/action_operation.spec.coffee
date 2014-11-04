'use strict'

describe 'ChActionOperation', ->
  $ch = null
  $httpBackend = null
  ChActionOperation = null
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
      ChActionOperation = $injector.get('ChActionOperation')

      entryPointContext = loadFixture('pm.context.entry_point')
      productContext = loadFixture('pm.context.product')
      affiliationContext = loadFixture('pm.context.affiliation')

      $httpBackend.whenGET(EP).respond(entryPointContext)
      $httpBackend.whenGET(PC).respond(productContext)
      $httpBackend.whenGET(AC).respond(affiliationContext)

      $httpBackend.whenGET('http://pm.mpx.dev/v20140601/products').respond({})
      $httpBackend.whenGET('http://pm.mpx.dev/v20140601/product/').respond({})
      $httpBackend.whenGET('http://pm.mpx.dev/v20140601/product/1').respond({})
      $httpBackend.whenGET('http://pm.mpx.dev/v20140601/product/1,2').respond({})
      $httpBackend.whenGET('http://pm.mpx.dev/v20140601/affiliation').respond({})

      $pm = $ch('pm')

  it 'gets an action operation', ->
    operation = $pm.$('products').$$('query')

    $httpBackend.flush()
    expect(operation).to.be.an.instanceof(ChActionOperation)

  it 'initializes collection action', ->
    operation = $pm.$('products').$c('query')

    $httpBackend.flush()
    expect(operation.$type).to.eq('collection')

  it 'initializes collection action for array of objects', ->
    objects = [
        '@context': 'http://pm.mpx.dev/v20140601/context/product'
        '@id': 'http://pm.mpx.dev/v20140601/product/1'
      ,
        '@context': 'http://pm.mpx.dev/v20140601/context/product'
        '@id': 'http://pm.mpx.dev/v20140601/product/2'
    ]

    operation = $pm.$(objects).$c('get')

    $httpBackend.flush()
    expect(operation.$type).to.eq('collection')

  it 'initializes magick collection action for array of objects', ->
    objects = [
        '@context': 'http://pm.mpx.dev/v20140601/context/product'
        '@id': 'http://pm.mpx.dev/v20140601/product/1'
      ,
        '@context': 'http://pm.mpx.dev/v20140601/context/product'
        '@id': 'http://pm.mpx.dev/v20140601/product/2'
    ]

    operation = $pm.$(objects).$$('get')

    $httpBackend.flush()
    expect(operation.$type).to.eq('collection')

  it 'initializes member action', ->
    operation = $pm.$('products').$m('get')

    $httpBackend.flush()
    expect(operation.$type).to.eq('member')

  it 'initializes member action for object', ->
    obj =
      '@context': 'http://pm.mpx.dev/v20140601/context/product'
      '@id': 'http://pm.mpx.dev/v20140601/product/1'

    operation = $pm.$(obj).$m('get')

    $httpBackend.flush()
    expect(operation.$type).to.eq('member')

  it 'initializes magic member action for object', ->
    obj =
      '@context': 'http://pm.mpx.dev/v20140601/context/product'
      '@id': 'http://pm.mpx.dev/v20140601/product/1'

    operation = $pm.$(obj).$$('get')

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

  context 'lazy loading', ->
    class ObjectsOperationDummy
      @calls = []
      constructor: ->
        ObjectsOperationDummy.calls.push(arguments)
        @$promise = then: angular.noop

    beforeEach ->
      ObjectsOperationDummy.calls = []

    it 'initializes lazy loader', ->
      $httpBackend.expectGET('http://pm.mpx.dev/v20140601/products').respond(members: [{ '@context': PC }])
      products = $pm.$('products').$$('query')

      objectsOperationStub = sinon.stub(products, 'ChObjectsOperation', ObjectsOperationDummy)

      $httpBackend.flush()

      # once: new ChContextOperation
      expect(ObjectsOperationDummy.calls.length).to.eq(1)

    it 'initializes lazy loader multiple times for different contexts', ->
      $httpBackend.expectGET('http://pm.mpx.dev/v20140601/products').respond(members: [{ '@context': 'foo' }, { '@context': 'bar' }])
      products = $pm.$('products').$$('query')

      objectsOperationStub = sinon.stub(products, 'ChObjectsOperation', ObjectsOperationDummy)

      $httpBackend.flush()

      # twice: context 'foo' and context 'bar'..
      expect(ObjectsOperationDummy.calls.length).to.eq(2)
