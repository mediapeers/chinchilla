'use strict'

describe 'Chinchilla', ->
  chinchilla = null

  beforeEach ->
    angular.mock.module("Chinchilla")
    inject ($injector) ->
      chinchilla = $injector.get('chinchilla')

  it "works", ->
    expect(true).to.be.truthy
