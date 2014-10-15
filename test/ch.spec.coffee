'use strict'

describe '$chProvider', ->
  $ch = null

  beforeEach ->
    angular.mock.module("chinchilla")

  beforeEach ->
    angular.mock.module ($chProvider) ->
      $chProvider.setEntryPoint('pm', 'http://pm.mpx.dev/v20140601/context/context')
      null

  describe '$ch', ->
    beforeEach ->
      inject ($injector) ->
        $ch = $injector.get('$ch')

    it "is callable with 0 arguments", ->
      $ch()

    it "is callable with 1 arguments", ->
      $ch('products')

    it "is callable with 2 arguments", ->
      $ch('um', 'products')

    it "is callable with 1 uri argument", ->
      $ch('http://pm.mpx.dev/v20140601/product/1')

    it "is callable with 1 object argument", ->
      obj =
        __id__: 'http://pm.mpx.dev/v20140601/product/1'
        __type__: 'users'

      $ch(obj)

    it "is callable with array of objects argument", ->
      arr = [
        __id__: 'http://pm.mpx.dev/v20140601/product/1'
        __type__: 'users'
      ,
        __id__: 'http://pm.mpx.dev/v20140601/product/2'
        __type__: 'users'
      ]

      $ch(arr)
