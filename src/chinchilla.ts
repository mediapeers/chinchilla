import { merge, last, startsWith } from 'lodash'
import { Subject } from './chinchilla/subject'
import { Config } from './chinchilla/config'
import { Context } from './chinchilla/context'
import { Cache } from './chinchilla/cache'

let chch = (objectsOrApp, model?) => {
  // detach from existing Subject first before creating a new one..
  objectsOrApp = Subject.detachFromSubject(objectsOrApp)

  return new Subject(objectsOrApp, model)
}

chch['config'] = Config
chch['cache']  = Cache

chch['new'] = (app, model, attrs = {}) => {
  return merge(
    { '@context': `${Config.endpoints[app]}/context/${model}` },
    attrs
  )
}

chch['contextUrl'] = (app, model) => {
  return `${Config.endpoints[app]}/context/${model}`
}
chch['context'] = (urlOrApp, model) => {
  if (!model) {
    // assume first param is the context url
    return Context.get(urlOrApp).ready
  }
  else {
    return Context.get(`${Config.endpoints[urlOrApp]}/context/${model}`).ready
  }
}

// unfurl('pm, 'product', 'query', params) -> defaults to $c
// unfurl('pm, 'product', '$c:query', params)
// unfurl('pm, 'product', '$m:query_descendants', params)
chch['unfurl'] = (app, model, actionName, params) => {
  return new Promise(function(resolve, reject) {
    var page = 1
    var result = { objects: [] }
    var subject = new Subject(app, model)
    merge(params, { page: page })

    var fetch = function() {
      var action = last(actionName.match(/(\$[c|m]:)?(.*)/))
      var promise
      if (startsWith(actionName, '$m')) {
        promise = subject.$m(action, params)
      }
      else {
        promise = subject.$c(action, params)
      }

      promise
        .then(function(pageResult) {
          page = page + 1
          merge(params, { page: page })
          result.objects = result.objects.concat(pageResult.objects)

          if ((page <= 100) && (page <= (pageResult.headers && pageResult.headers['x-total-pages'] || 0))) {
            fetch()
          }
          else {
            resolve(result)
          }
          return true
        }, function() {
          reject(null)
        })
    }

    fetch()
  })
}

export default chch
