'use strict'

describe 'ChRequestBuilder', ->
  $ch = null
  $httpBackend = null
  $pm = null
  $injector = null
  ChRequestBuilder = null
  ChContext = null
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
    inject (_$injector_) ->
      $injector = _$injector_
      $ch = $injector.get('$ch')
      $httpBackend = $injector.get('$httpBackend')
      ChRequestBuilder = $injector.get('ChRequestBuilder')
      ChContext = $injector.get('ChContext')

      entryPointContext = loadFixture('pm.context.entry_point')
      productContext = loadFixture('pm.context.product')

      $httpBackend.whenGET(EP).respond(entryPointContext)
      $httpBackend.whenGET(PC).respond(productContext)
      $httpBackend.whenGET(AC).respond({})

      $pm = $ch('pm')
      $httpBackend.flush()

  describe 'ChRequestBuilder', ->
    describe '.init', ->
      it 'works', ->
        context = new ChContext('@context': member_actions: { get: {} })
        ChRequestBuilder.init(context, {}, 'member', 'get')

      it 'returns an instance of ChMemberRequestBuilder', ->
        context = new ChContext('@context': member_actions: { get: {} })
        builder = ChRequestBuilder.init(context, {}, 'member', 'get')
        expect(builder).to.be.instanceof($injector.get('ChMemberRequestBuilder'))

      it 'returns an instance of ChCollectionRequestBuilder', ->
        context = new ChContext('@context': collection_actions: { query: {} })
        builder = ChRequestBuilder.init(context, [], 'collection', 'query')
        expect(builder).to.be.instanceof($injector.get('ChCollectionRequestBuilder'))

    describe '#perform', ->
      it 'hits backend with expected url', ->
        $httpBackend.expectGET('http://pm.mpx.dev/v20140601/product/1').respond(null)

        context = new ChContext(loadFixture('pm.context.product'))
        product =
          '@id': 'http://pm.mpx.dev/v20140601/product/1'
          '@context': 'http://pm.mpx.dev/v20140601/context/product'
          'id': 1
          'title': 'TheDreamers'

        builder = ChRequestBuilder.init(context, product, 'member', 'get')
        builder.performRequest()
        $httpBackend.flush()

  describe 'ChMemberRequestBuilder', ->
    context = null
    product = null

    beforeEach ->
      product =
        '@id': 'http://pm.mpx.dev/v20140601/product/1'
        '@context': 'http://pm.mpx.dev/v20140601/context/product'
        'id': 1
        'title': 'TheDreamers'

      context = new ChContext(loadFixture('pm.context.product'))

    describe '#extractAttributes', ->
      it 'returns id attribues for single object', ->
        builder = ChRequestBuilder.init(context, product, 'member', 'get')

        expect(builder.extractAttributes()).to.be.like(id: '1')

    describe '#buildUrl', ->
      it 'builds url', ->
        builder = ChRequestBuilder.init(context, product, 'member', 'foo')

        expect(builder.buildUrl()).to.eq('http://pm.mpx.dev/v20140601/product/1?name=TheDreamers')

      it 'builds url using @id', ->
        product =
          '@id': 'http://pm.mpx.dev/v20140601/product/1'
          'title': 'TheDreamers'

        builder = ChRequestBuilder.init(context, product, 'member', 'foo')
        expect(builder.buildUrl()).to.eq('http://pm.mpx.dev/v20140601/product/1?name=TheDreamers')

      it 'builds url using id value', ->
        product =
          'id': 1,
          'title': 'TheDreamers'

        builder = ChRequestBuilder.init(context, product, 'member', 'foo')
        expect(builder.buildUrl()).to.eq('http://pm.mpx.dev/v20140601/product/1?name=TheDreamers')


  describe 'ChCollectionRequestBuilder', ->
    context = null
    product1 = null
    product2 = null

    beforeEach ->
      product1 =
        '@id': 'http://pm.mpx.dev/v20140601/product/1'
        '@context': 'http://pm.mpx.dev/v20140601/context/product'
        'id': 1
        'title': 'TheDreamers'

      product2 =
        '@id': 'http://pm.mpx.dev/v20140601/product/3'
        '@context': 'http://pm.mpx.dev/v20140601/context/product'
        'id': 3
        'title': 'NightOnEarth'

      context = new ChContext(loadFixture('pm.context.product'))

    describe '#extractAttributes', ->
      it 'returns id attribues for a collection of objects', ->
        builder = ChRequestBuilder.init(context, [product1, product2], 'collection', 'query')

        expect(builder.extractAttributes()).to.be.like(id: ['1', '3'])

    describe '#buildUrl', ->
      it 'builds url', ->
        builder = ChRequestBuilder.init(context, [product1, product2], 'collection', 'query')
        expect(builder.buildUrl()).to.eq('http://pm.mpx.dev/v20140601/products?ids=1,3')

      it 'builds url using @id', ->
        product1 =
          '@id': 'http://pm.mpx.dev/v20140601/product/1'

        product2 =
          '@id': 'http://pm.mpx.dev/v20140601/product/3'

        builder = ChRequestBuilder.init(context, [product1, product2], 'collection', 'query')
        expect(builder.buildUrl()).to.eq('http://pm.mpx.dev/v20140601/products?ids=1,3')

      it 'builds url using id value', ->
        product1 =
          'id': 1

        product2 =
          'id': 3

        builder = ChRequestBuilder.init(context, [product1, product2], 'collection', 'query')
        expect(builder.buildUrl()).to.eq('http://pm.mpx.dev/v20140601/products?ids=1,3')
