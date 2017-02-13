'use strict'

describe '$chSessionProvider', ->
  $chSession = null
  $location  = null

  beforeEach ->
    angular.mock.module("chinchilla")
    sinon.useFakeTimers()

  describe '$chSession', ->
    beforeEach ->
      inject ($injector) ->
        $chSession = $injector.get('$chSession')
        $location  = $injector.get('$location')

    afterEach ->
      $chSession.clearSessionId()

    describe '.domain', ->
      it 'returns base domain', ->
        sinon.stub($location, 'host').returns('um.mgm.mpx.com')
        expect($chSession.domain()).to.equal('mpx.com')

      it 'returns localhost (no tld)', ->
        sinon.stub($location, 'host').returns('localhost')
        expect($chSession.domain()).to.equal('localhost')
