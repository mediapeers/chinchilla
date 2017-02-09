"use strict";
var lodash_1 = require('lodash');
var UriTemplate = require('uri-templates');
var Extractor = (function () {
    function Extractor() {
    }
    Extractor.extractMemberParams = function (context, obj) {
        var action = context.memberAction('get');
        return Extractor.extractParams(action, obj);
    };
    Extractor.extractCollectionParams = function (context, obj) {
        var action = context.collectionAction('query');
        return Extractor.extractParams(action, obj);
    };
    // expands given params to include variable mappings in addition
    // for this input:
    // { id: 4 }
    // and this template:
    // http//server/user/{user_id}
    // with mapping
    // { source: id, variable: user_id }
    //
    // the returned object would be:
    // { id: 4, user_id: 4 }
    Extractor.uriParams = function (action, params) {
        if (params === void 0) { params = {}; }
        var uriParams = lodash_1.clone(params);
        lodash_1.each(action.mappings, function (mapping) {
            if (!uriParams[mapping.variable])
                uriParams[mapping.variable] = params[mapping.source];
        });
        return uriParams;
    };
    Extractor.extractParams = function (contextAction, obj) {
        if (lodash_1.isEmpty(obj) || lodash_1.isEmpty(contextAction))
            return {};
        if (lodash_1.isArray(obj)) {
            return Extractor.extractArrayValues(contextAction, obj);
        }
        else {
            return Extractor.extractValues(contextAction, obj);
        }
    };
    Extractor.extractValues = function (contextAction, object) {
        var id = object && object['@id'];
        if (!id)
            return {};
        var result = {};
        var template = new UriTemplate(contextAction.template);
        var values = template.fromUri(id);
        if (lodash_1.isEmpty(values))
            return {};
        lodash_1.each(contextAction.mappings, function (mapping) {
            var value = values[mapping.variable];
            if (!value)
                return;
            result[mapping.source] = value;
        });
        return result;
    };
    Extractor.extractArrayValues = function (contextAction, objects) {
        var values = lodash_1.map(objects, function (obj) {
            return Extractor.extractValues(contextAction, obj);
        });
        values = lodash_1.compact(values);
        var result = {};
        lodash_1.each(contextAction.mappings, function (mapping) {
            result[mapping.source] = [];
            lodash_1.each(values, function (attrs) {
                if (!attrs[mapping.source])
                    return;
                if (lodash_1.include(result[mapping.source], attrs[mapping.source]))
                    return;
                result[mapping.source].push(attrs[mapping.source]);
            });
        });
        return result;
    };
    return Extractor;
}());
exports.Extractor = Extractor;
