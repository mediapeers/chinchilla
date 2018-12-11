import { concat, without, delay } from 'lodash'

let actions = [] as string[]
let listeners = [] as Function[]

const next = () => {
  const cb = listeners.pop()
  cb && delay(cb, 100)
}

export const Watcher = {
  actions: actions,
  listeners: listeners,
  start: (id) => {
    actions = concat(actions, id)
  },
  complete: (id) => {
    actions = without(actions, id)
    if (actions.length === 0) next()
  },
  performLater: (cb) => {
    delay(() => {
      listeners.push(cb)
      if (actions.length === 0) next()
    }, 100)
  }
}
