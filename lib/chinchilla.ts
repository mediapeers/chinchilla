import { merge } from 'lodash'
import { Subject } from './chinchilla/subject'
import { Config } from './chinchilla/config'
import { Context } from './chinchilla/context'

export default class chch {
  public static subject(objectsOrApp, model?) {
    // detach from existing Subject first before creating a new one..
    objectsOrApp = Subject.detachFromSubject(objectsOrApp)

    return new Subject(objectsOrApp, model)
  }

  public static config = Config

  public static new(app, model, attrs = {}) {
    return merge(
      { '@context': `${Config.endpoints[app]}/context/${model}` },
      attrs
    )
  }

  public static contextUrl(app, model) {
    return `${Config.endpoints[app]}/context/${model}`
  }

  public static context(urlOrApp, model) {
    if (!model) {
      // assume first param is the context url
      return Context.get(urlOrApp).ready
    }
    else {
      return Context.get(`${Config.endpoints[urlOrApp]}/context/${model}`).ready
    }
  }
}
