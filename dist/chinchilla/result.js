"use strict";
const lodash_1 = require("lodash");
const subject_1 = require("./subject");
class Result {
    constructor() {
        this.objects = [];
        this.objects_raw = [];
    }
    success(result) {
        this.headers = result.headers;
        if (result.body) {
            this.type = result.body['@type'];
            this.aggregations = result.body['aggregations'];
        }
        switch (this.type) {
            case 'graph':
                var members = result.body['@graph'];
                if (!members)
                    return;
                this.objects_raw = members;
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
exports.Result = Result;
class ErrorResult extends Error {
    constructor(message) {
        super(message);
    }
    error(result) {
        this.headers = result.headers;
        this.object = result.body;
        this.statusCode = result.statusCode;
        this.statusText = result.statusText;
        this.url = result.req.url;
        this.method = result.req.method;
        return this;
    }
}
exports.ErrorResult = ErrorResult;
