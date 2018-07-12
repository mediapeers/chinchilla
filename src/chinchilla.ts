import * as Promise from 'bluebird'
import { merge, last, startsWith } from 'lodash'
import { Subject } from './chinchilla/subject'
import { Config } from './chinchilla/config'
import { Context } from './chinchilla/context'
import { Cache } from './chinchilla/cache'
import { Extractor } from './chinchilla/extractor'

const chch = Object.assign(
  (objectsOrApp, model?, config? : Config) => {
    // detach from existing Subject first before creating a new one..
    objectsOrApp = Subject.detachFromSubject(objectsOrApp)

    return new Subject(objectsOrApp, model, config)
  },
  {
    config: Config.getInstance(),
    cache: Cache,
    extractor: Extractor,
    new: (app, model, attrs = {}, config?: Config) => {
      config = config || Config.getInstance()

      return merge(
        { '@context': `${config.settings.endpoints[app]}/context/${model}` },
        attrs
      )
    },
    contextUrl: (app, model, config?: Config) => {
      config = config || Config.getInstance()

      return `${config.settings.endpoints[app]}/context/${model}`
    },
    context: (urlOrApp, model?: string, config?: Config) => {
      config = config || Config.getInstance()

      if (!model) {
        // assume first param is the context url
        return Context.get(urlOrApp, config).ready
      }
      else {
        return Context.get(`${config.settings.endpoints[urlOrApp]}/context/${model}`, config).ready
      }
    },
    // unfurl('pm, 'product', 'query', params) -> defaults to $c
    // unfurl('pm, 'product', '$c:query', params)
    // unfurl('pm, 'product', '$m:query_descendants', params)
    unfurl: (app, model, actionName, params) => {
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
  },
)


export default chch
