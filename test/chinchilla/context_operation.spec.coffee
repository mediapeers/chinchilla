'use strict'

describe 'ChContextOp', ->
  $ch = null
  $httpBackend = null
  ChContext = null
  ChContextOp = null
  $pm = null
  EP = 'http://pm.mpx.dev/v20140601/context/entry_point'
  ProductContextUrl = 'http://pm.mpx.dev/v20140601/context/product'

  beforeEach ->
    angular.mock.module("chinchilla")

  beforeEach ->
    angular.mock.module ($chProvider) ->
      $chProvider.setEntryPoint('pm', EP)
      null

  afterEach ->
    $httpBackend.flush()
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()

  beforeEach ->
    inject ($injector) ->
      $ch = $injector.get('$ch')
      $httpBackend = $injector.get('$httpBackend')
      ChContext = $injector.get('ChContext')
      ChContextOp = $injector.get('ChContextOp')

      entryPointContext = loadFixture('pm.context.entry_point')
      $httpBackend.whenGET(EP).respond(entryPointContext)

      $pm = $ch('pm')

  it 'requests the context for product', ->
    $httpBackend.expectGET(ProductContextUrl).respond(null)
    operation = $pm.$('products')

  it 'responds to $$', ->
    expect($pm).to.respondTo('$$')
