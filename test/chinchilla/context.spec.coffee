'use strict'

describe 'ChContext', ->
  $ch = null
  ChContext = null
  instance = null

  beforeEach ->
    angular.mock.module("chinchilla")
    sinon.useFakeTimers()

  beforeEach ->
    inject ($injector) ->
      $ch = $injector.get('$ch')
      $httpBackend = $injector.get('$httpBackend')
      ChContext = $injector.get('ChContext')

      instance = new ChContext(loadFixture('pm.context.product'))

  describe '#isAssociation', ->
    it 'is true for association', ->
      property = instance.property('affiliation')
      expect(property.isAssociation).to.be.true

    it 'is false for regular property', ->
      property = instance.property('display_title')
      expect(property.isAssociation).to.be.false

  describe '#association', ->
    it 'returns association property', ->
      assoc = instance.association('layers')
      expect(assoc).to.be.defined
      expect(assoc.isAssociation).to.be.true
