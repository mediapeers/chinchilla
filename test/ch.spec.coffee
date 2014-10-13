'use strict'

describe '$chProvider', ->
  $ch = null

  beforeEach ->
    angular.mock.module("chinchilla")

  beforeEach ->
    angular.mock.module ($chProvider) ->
      $chProvider.setEndpoint('um', 'http://example.com')
      null

  beforeEach ->
    inject ($injector) ->
      $ch = $injector.get('$ch')

  it "works", ->
    $ch('Foo')

