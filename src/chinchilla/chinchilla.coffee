angular.module('chinchilla').factory 'ch_Chinchilla', () ->
  class Chinchilla
    constructor: (definition, @provider) ->
      console.log("Chinchilla is initialized: #{definition}")
      console.log @provider.endpoints
