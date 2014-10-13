# test_helper

expect = chai.expect

fnResolvable = ($q) ->
  (data) ->
    q = $q.defer()
    q.resolve(data)
    q.promise

fnRejectable = ($q) ->
  (data) ->
    q = $q.defer()
    q.reject(data)
    q.promise


_.extend(window, {
  expect: expect,
  fnResolvable: fnResolvable,
  fnRejectable: fnRejectable
})

