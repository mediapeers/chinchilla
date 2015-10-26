'use strict'

describe 'ChLazyAssociation', ->
  $ch = null
  $httpBackend = null
  ChContext = null
  ChContextOperation = null
  ChLazyLoader = null
  EP = 'http://pm.mpx.dev/v20140601'
  PC = 'http://pm.mpx.dev/v20140601/context/product?t=0'
  LC = 'http://pm.mpx.dev/v20140601/context/layer?t=0'

  # contexts of submodels
  PC_SUB = 'http://pm.mpx.dev/v20140601/context/product/motion_picture?t=0'
  LC_SUB = 'http://pm.mpx.dev/v20140601/context/layer/standard?t=0'

  productContext = null
  productSubContext = null
  layerContext = null
  layerInversedContext = null

  products = {
    "@id":"http://pm.mpx.dev/v20140601/products?per=3&page=1&sort=full_title&order=asc&t=0",
    "@context":"http://pm.mpx.dev/v20140601/context/collection?11846059151",
    "@type":"collection",
    "members":[
      {
        "@id":"http://pm.mpx.dev/v20140601/product/1",
        "@context":"http://pm.mpx.dev/v20140601/context/product",
        "@type":"product/motion_picture/format",
        "id": 1,
        "full_title":"245 A.D.",
        "layers":{
          "@id":"http://pm.mpx.dev/v20140601/products/1/layers"
        }
      },
      {
        "@id":"http://pm.mpx.dev/v20140601/product/2",
        "@context":"http://pm.mpx.dev/v20140601/context/product",
        "@type":"product/motion_picture/format",
        "id": 2,
        "full_title":"Night On Earth",
        "layers":{
          "@id":"http://pm.mpx.dev/v20140601/products/2/layers"
        }
      }
    ]
  }
  layers = {
    "@id":"http://pm.mpx.dev/v20140601/products/1,2/layers/?t=0",
    "@context":"http://pm.mpx.dev/v20140601/context/collection?11846059151",
    "@type":"collection",
    "members":[
      {
        "@id":"http://pm.mpx.dev/v20140601/products/1/layers/1",
        "@context":"http://pm.mpx.dev/v20140601/context/layer",
        "@type":"layer",
        "id": 1,
        "product":{
          "@id":"http://pm.mpx.dev/v20140601/product/1"
        }
      },
      {
        "@id":"http://pm.mpx.dev/v20140601/products/2/layers/2",
        "@context":"http://pm.mpx.dev/v20140601/context/layer",
        "@type":"layer",
        "id": 2,
        "product":{
          "@id":"http://pm.mpx.dev/v20140601/product/2",
        }
      }
    ]
  }

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
      ChLazyLoader = $injector.get('ChLazyLoader')

      productContext = loadFixture('pm.context.product')
      layerContext = loadFixture('pm.context.layer')

      # contexts of submodels
      productSubContext = loadFixture('pm.context.product_sub')
      layerInversedContext = loadFixture('pm.context.layer_inversed')

      $httpBackend.whenGET('http://pm.mpx.dev/v20140601/products?t=0').respond(products)
      $httpBackend.whenGET('http://pm.mpx.dev/v20140601/products/1,2/layers/?t=0').respond(layers)


  it 'loads layers and assigns them to products', (done) ->
    $httpBackend.whenGET(PC).respond(productContext)
    $httpBackend.whenGET(LC).respond(layerContext)

    $ch.c('pm', 'product').$c('query').$promise.then (operation) ->
      product1 = operation.$arr[0]
      product2 = operation.$arr[1]

      # trigger layer load
      product1.layersPromise
      .finally ->
        expect(product1.layers.length).to.eq(1)
        expect(product2.layers.length).to.eq(1)

        expect(product1.layers[0]['@id']).to.eq('http://pm.mpx.dev/v20140601/products/1/layers/1')
        expect(product2.layers[0]['@id']).to.eq('http://pm.mpx.dev/v20140601/products/2/layers/2')

        done()

    $httpBackend.flush()

  it 'fails to assign layers to products if context @id does not match', (done) ->
    $httpBackend.whenGET(PC).respond(productSubContext)
    $httpBackend.whenGET(LC).respond(layerContext)

    $ch.c('pm', 'product').$c('query').$promise.then (operation) ->
      product1 = operation.$arr[0]
      product2 = operation.$arr[1]

      # trigger layer load
      product1.layersPromise
      .finally ->
        expect(product1.layers.length).to.be.empty
        expect(product2.layers.length).to.be.empty

        done()

    $httpBackend.flush()

  it 'succeeds to assign layers to products if context @id does not match but inverse_of is defined', (done) ->
    $httpBackend.whenGET(PC).respond(productSubContext)
    $httpBackend.whenGET(LC).respond(layerInversedContext)

    $ch.c('pm', 'product').$c('query').$promise.then (operation) ->
      product1 = operation.$arr[0]
      product2 = operation.$arr[1]

      # trigger layer load
      product1.layersPromise
      .finally ->
        expect(product1.layers.length).to.eq(1)
        expect(product2.layers.length).to.eq(1)

        expect(product1.layers[0]['@id']).to.eq('http://pm.mpx.dev/v20140601/products/1/layers/1')
        expect(product2.layers[0]['@id']).to.eq('http://pm.mpx.dev/v20140601/products/2/layers/2')

        done()

    $httpBackend.flush()
