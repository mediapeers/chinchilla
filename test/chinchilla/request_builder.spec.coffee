'use strict'

describe 'ChRequestBuilder', ->
  $ch = null
  $httpBackend = null
  $pm = null
  $injector = null
  ChRequestBuilder = null
  ChContext = null
  EP = 'http://pm.mpx.dev/v20140601'
  EPC = 'http://pm.mpx.dev/v20140601/context/entry_point?t=0'
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
    inject (_$injector_) ->
      $injector = _$injector_
      $ch = $injector.get('$ch')
      $httpBackend = $injector.get('$httpBackend')
      ChRequestBuilder = $injector.get('ChRequestBuilder')
      ChContext = $injector.get('ChContext')

      entryPointContext = loadFixture('pm.context.entry_point')
      productContext = loadFixture('pm.context.product')

      $httpBackend.whenGET(EPC).respond(entryPointContext)
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

      $httpBackend.expectGET('http://um.mpx.com/roles/15?foo=foo&t=0').respond(null)

      builder.performRequest()
      $httpBackend.flush()

  describe '#data', ->
    it 'builds data for multi update', ->
      context = new ChContext(
        '@context':
          collection_actions:
            update:
              template: 'http://um.mpx.com/roles/{ids}'
              mappings: [
                  variable: 'ids'
                  source: 'id'
                  required: true
              ]
      )

      subject = [
       { id: 3, foo: 'lorem', '$promise': 'dummy', errors: [] }
       { id: 6, foo: 'ipsum', '$promise': 'dummy', errors: [] }
      ]

      builder = new ChRequestBuilder(context, subject, 'collection', 'update', {})

      expected =
        3: { id: 3, foo: 'lorem' },
        6: { id: 6, foo: 'ipsum' }

      data = builder.data()

      expect(data).to.be.like(expected)

    it 'builds data for create with nested objects', ->
      context = new ChContext(
        '@context':
          collection_actions:
            create:
              template: 'http://um.mpx.com/roles'
      )
      subject =
        name: 'hello'
        $angular: 'some value'
        funky: -> 'hey'
        access_level: 'private'
        casts: [
          { foo: 'lorem' }
          { foo: 'ipsum' }
        ]

      builder = new ChRequestBuilder(context, subject, 'collection', 'create', {})

      expected =
        name: 'hello'
        access_level: 'private'
        casts_attributes: [
          { foo: 'lorem' }
          { foo: 'ipsum' }
        ]

      data = builder.data()

      expect(data).to.be.like(expected)
