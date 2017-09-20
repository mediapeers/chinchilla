import { each, find, first, groupBy, isArray, isEmpty, startsWith } from 'lodash'
import { Subject } from './subject'

export class Result {
  type: string
  headers: any
  aggregations: any
  objects: any[] = []
  objects_raw: any[] = []

  success(result): void {
    this.headers  = result.headers

    if (result.body) {
      this.type         = result.body['@type']
      this.aggregations = result.body['aggregations']

      each(result.body, (value, key) => {
        if (startsWith(key, "@")) this[key] = value
      })
    }

    switch (this.type) {
      case 'graph':
        var members = result.body['@graph']
        if (!members) return

        this.objects_raw = members

        new Subject(members)

        each(members, (node) => {
          if (node.parent_id) {
            // this is a child
            var parent = find(members, (x) => {
              return x.id === node.parent_id
            })
            if (parent) {
              if (!parent.children) parent.children = []
              parent.children.push(node)
            }
            return true // continue loop
          }
          else {
            // root
            this.objects.push(node)
          }
        })
        break

      case 'collection':
      case 'search_collection':
        each(result.body.members, (member) => {
          this.objects.push(member)
        })

        var byContext = groupBy(this.objects, '@context')

        // creates new Subject for each group ob objects that share the same @context
        each(byContext, (objects, context) => {
          new Subject(objects)
        })
        break

      default:
        if (isArray(result.body)) throw new Error("Unexpectedly got an array")
        if (isEmpty(result.body)) break
        this.objects.push(result.body)
        new Subject(this.object)
        break
    }
  }

  get object() {
    return first(this.objects)
  }
}
