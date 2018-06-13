import { each, find, first, groupBy, isArray, isEmpty, startsWith } from 'lodash'
import { Subject } from './subject'

export class Result {
  static paginationProps = ['@total_count', '@total_pages', '@current_page']

  type: string
  headers: any
  aggregations: any
  body: any
  objects: any[] = []
  pagination: any

  success(result, raw = false): void {
    this.headers  = result.headers

    if (result.body) {
      this.type         = result.body['@type']
      this.aggregations = result.body['aggregations']
      this.body         = result.body
    }

    switch (this.type) {
      case 'graph':
        var members = result.body['@graph']
        if (!members) return

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
        this.pagination = {}

        each(Result.paginationProps, (prop) => {
          if (result.body[prop]) {
            this.pagination[prop.substr(1)] = result.body[prop]
          }
        })
        each(result.body.members, (member) => {
          this.objects.push(member)
        })

        if (raw) break
        var byContext = groupBy(this.objects, '@context')

        // creates new Subject for each group ob objects that share the same @context
        each(byContext, (objects, context) => {
          new Subject(objects)
        })
        break

      default:
        if (!result.body) break

        this.objects = isArray(result.body) ? result.body : [result.body]

        if (!raw) new Subject(this.object)
        break
    }
  }

  get object() {
    return first(this.objects)
  }
}
