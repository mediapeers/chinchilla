'use strict'

describe 'ChUtils', ->
  $injector = null
  ChUtils = null
  action =
    template: 'http://foo.bar/{obj_type}/{obj_id}'
    mappings: [
        variable: 'obj_type'
        source: 'type'
        required: 'true'
      ,
        variable: 'obj_id'
        source: 'id'
        required: 'true'
    ]

  beforeEach ->
    angular.mock.module("chinchilla")

  beforeEach ->
    inject (_$injector_) ->
      $injector = _$injector_
      ChUtils = $injector.get('ChUtils')

  describe '.extractValues', ->
    it 'extract values for single object from @id', ->
      obj = '@id': 'http://foo.bar/standard/5'

      expected =
        id: '5'
        type: 'standard'

      expect(ChUtils.extractValues(action, obj)).to.be.like(expected)

  describe '.extractArrayValues', ->
    it 'extract values for multiple objects from @id', ->
      obj1 = '@id': 'http://foo.bar/standard/5'
      obj2 = '@id': 'http://foo.bar/itunes/6'

      expected =
        id: ['5', '6']
        type: ['standard', 'itunes']

      expect(ChUtils.extractArrayValues(action, [obj1, obj2])).to.be.like(expected)

    it 'extract unique values for multiple objects from @id', ->
      obj1 = '@id': 'http://foo.bar/standard/5'
      obj2 = '@id': 'http://foo.bar/standard/6'

      expected =
        id: ['5', '6']
        type: ['standard']

      expect(ChUtils.extractArrayValues(action, [obj1, obj2])).to.be.like(expected)
