import { each, find, first, groupBy, isArray } from 'lodash'
import { Subject } from './subject'
import { Config } from './config'

export class Result {
  static paginationProps = ['@total_count', '@total_pages', '@current_page']

  type: string
  headers: any
  aggregations: any
  body: any
  options: any
  objects: any[] = []
  pagination: any

  success(result, config: Config, options?: any): void {
    this.headers  = result.headers
    this.body     = result.body
    this.options  = options || {}

    if (result.body) {
      this.type         = result.body['@type']
      this.aggregations = result.body['aggregations']
    }

    switch (this.type) {
      case 'graph':
        var members = result.body['@graph']
        if (!members) return

        new Subject(members, config)

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

        if (this.options.rawResult) break

        var byContext = groupBy(this.objects, '@context')

        // creates new Subject for each group ob objects that share the same @context
        each(byContext, (objects) => {
          new Subject(objects, config)
        })
        break

      default:
        this.objects = isArray(result.body) ? result.body : [result.body]
        if (result.body && !this.options.rawResult) new Subject(this.object, config)
        break
    }
  }

  get object() {
    return first(this.objects)
  }
}
