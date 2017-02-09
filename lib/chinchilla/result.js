"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lodash_1 = require('lodash');
var subject_1 = require('./subject');
var Result = (function () {
    function Result() {
        this.objects = [];
        this.objects_raw = [];
    }
    Result.prototype.success = function (result) {
        var _this = this;
        this.headers = result.headers;
        if (result.body && result.body.aggregations)
            this.aggregations = result.body.aggregations;
        switch (result.body && result.body['@type']) {
            case 'graph':
                var members = result.body['@graph'];
                if (!members)
                    return;
                this.objects_raw = members;
                new subject_1.Subject(members);
                lodash_1.each(members, function (node) {
                    if (node.parent_id) {
                        // this is a child
                        var parent = lodash_1.find(members, function (x) {
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
                        _this.objects.push(node);
                    }
                });
                break;
            case 'collection':
            case 'search_collection':
                lodash_1.each(result.body.members, function (member) {
                    _this.objects.push(member);
                });
                var byContext = lodash_1.groupBy(this.objects, '@context');
                // creates new Subject for each group ob objects that share the same @context
                lodash_1.each(byContext, function (objects, context) {
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
    };
    Object.defineProperty(Result.prototype, "object", {
        get: function () {
            return lodash_1.first(this.objects);
        },
        enumerable: true,
        configurable: true
    });
    return Result;
}());
exports.Result = Result;
var ErrorResult = (function (_super) {
    __extends(ErrorResult, _super);
    function ErrorResult(message) {
        _super.call(this, message);
    }
    ErrorResult.prototype.error = function (result) {
        this.headers = result.headers;
        this.object = result.body;
        this.statusCode = result.statusCode;
        this.statusText = result.statusText;
        this.url = result.req.url;
        this.method = result.req.method;
        return this;
    };
    return ErrorResult;
}(Error));
exports.ErrorResult = ErrorResult;
