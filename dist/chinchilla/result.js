"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const subject_1 = require("./subject");
class Result {
    constructor() {
        this.objects = [];
    }
    success(result) {
        this.headers = result.headers;
        if (result.body) {
            this.type = result.body['@type'];
            this.aggregations = result.body['aggregations'];
            this.body = result.body;
        }
        switch (this.type) {
            case 'graph':
                var members = result.body['@graph'];
                if (!members)
                    return;
                new subject_1.Subject(members);
                lodash_1.each(members, (node) => {
                    if (node.parent_id) {
                        // this is a child
                        var parent = lodash_1.find(members, (x) => {
                            return x.id === node.parent_id;
                        });
                        if (parent) {
                            if (!parent.children)
                                parent.children = [];
                            parent.children.push(node);
                        }
                        return true; // continue loop
                    }
                    else {
                        // root
                        this.objects.push(node);
                    }
                });
                break;
            case 'collection':
            case 'search_collection':
                this.pagination = {};
                lodash_1.each(Result.paginationProps, (prop) => {
                    if (result.body[prop]) {
                        this.pagination[prop.substr(1)] = result.body[prop];
                    }
                });
                lodash_1.each(result.body.members, (member) => {
                    this.objects.push(member);
                });
                var byContext = lodash_1.groupBy(this.objects, '@context');
                // creates new Subject for each group ob objects that share the same @context
                lodash_1.each(byContext, (objects, context) => {
                    new subject_1.Subject(objects);
                });
                break;
            default:
                if (lodash_1.isArray(result.body))
                    throw new Error("Unexpectedly got an array");
                if (lodash_1.isEmpty(result.body))
                    break;
                this.objects.push(result.body);
                new subject_1.Subject(this.object);
                break;
        }
    }
    get object() {
        return lodash_1.first(this.objects);
    }
}
Result.paginationProps = ['@total_count', '@total_pages', '@current_page'];
exports.Result = Result;
