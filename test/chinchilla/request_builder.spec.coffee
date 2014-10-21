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

  describe '#extractFrom', ->
    context 'extract from @id of ONE association (or single object)', ->
      it 'extracts values', ->
        obj =
          '@id': 'http://um.mpx.com/role/15',

        context = new ChContext(
          '@context':
            member_actions:
              get:
                template: 'http://um.mpx.com/role/{role_id}'
                mappings: [
                    variable: 'role_id'
                    source: 'id'
                    required: true
                ]
        )

        builder = new ChRequestBuilder(context, 'role', 'member', 'get')

        expect(builder.extractFrom(obj, 'member')).to.be.like(id: '15')

    context 'extract from @id of MANY association', ->
      it 'extracts values', ->
        obj =
          '@id': 'http://um.mpx.com/roles/1,4,5',

        context = new ChContext(
          '@context':
            collection_actions:
              query:
                template: 'http://um.mpx.com/roles/{ids}'
                mappings: [
                    variable: 'ids'
                    source: 'id'
                    required: true
                ]
        )

        builder = new ChRequestBuilder(context, 'role', 'collection', 'query')

        expect(builder.extractFrom(obj, 'collection')).to.be.like(id: ['1', '4', '5'])

    context 'extract from @id from HABTM association (or multiple objects)', ->
      it 'extracts values', ->
        obj =[
            '@id': 'http://um.mpx.com/role/1',
          ,
            '@id': 'http://um.mpx.com/role/2',
        ]

        context = new ChContext(
          '@context':
            member_actions:
              get:
                template: 'http://um.mpx.com/role/{role_id}'
                mappings: [
                    variable: 'role_id'
                    source: 'id'
                    required: true
                ]
        )

        builder = new ChRequestBuilder(context, 'role', 'collection', 'query')

        expect(builder.extractFrom(obj, 'member')).to.be.like(id: ['1', '2'])

  describe '#performRequest', ->
    it 'sends request', ->
      obj =
        '@id': 'http://um.mpx.com/role/15',

      context = new ChContext(
        '@context':
          member_actions:
            get:
              template: 'http://um.mpx.com/role/{role_id}'
              mappings: [
                  variable: 'role_id'
                  source: 'id'
                  required: true
              ]
          collection_actions:
            query:
              method: 'GET'
              template: 'http://um.mpx.com/roles/{ids}{?foo}'
              mappings: [
                  variable: 'ids'
                  source: 'id'
                  required: true
                ,
                  variable: 'foo'
              ]
      )

      builder = new ChRequestBuilder(context, 'role', 'collection', 'query')
      builder.extractFrom(obj, 'member')
      builder.mergeParams(foo: 'foo', bar: 'bar')

      $httpBackend.expectGET('http://um.mpx.com/roles/15?foo=foo').respond(null)

      builder.performRequest()
      $httpBackend.flush()
