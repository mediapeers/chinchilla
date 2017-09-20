"use strict";
const lodash_1 = require("lodash");
const UriTemplate = require("uri-templates");
class Extractor {
    static extractMemberParams(context, obj) {
        var action = context.memberAction('get');
        return Extractor.extractParams(action, obj);
    }
    static extractCollectionParams(context, obj) {
        var action = context.collectionAction('query');
        return Extractor.extractParams(action, obj);
    }
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
    static uriParams(action, params = {}) {
        var uriParams = lodash_1.clone(params);
        lodash_1.each(action.mappings, (mapping) => {
            if (!uriParams[mapping.variable])
                uriParams[mapping.variable] = params[mapping.source];
        });
        return uriParams;
    }
    static extractParams(contextAction, obj) {
        if (lodash_1.isEmpty(obj) || lodash_1.isEmpty(contextAction))
            return {};
        if (lodash_1.isArray(obj)) {
            return Extractor.extractArrayValues(contextAction, obj);
        }
        else {
            return Extractor.extractValues(contextAction, obj);
        }
    }
    static extractValues(contextAction, object) {
        var id = object && object['@id'];
        if (!id)
            return {};
        var result = {};
        var template = new UriTemplate(contextAction.template);
        var values = template.fromUri(id);
        if (lodash_1.isEmpty(values))
            return {};
        lodash_1.each(contextAction.mappings, (mapping) => {
            var value = values[mapping.variable];
            if (!value)
                return;
            result[mapping.source] = value;
        });
        return result;
    }
    static extractArrayValues(contextAction, objects) {
        var values = lodash_1.map(objects, (obj) => {
            return Extractor.extractValues(contextAction, obj);
        });
        values = lodash_1.compact(values);
        var result = {};
        lodash_1.each(contextAction.mappings, (mapping) => {
            result[mapping.source] = [];
            lodash_1.each(values, (attrs) => {
                if (!attrs[mapping.source])
                    return;
                if (lodash_1.include(result[mapping.source], attrs[mapping.source]))
                    return;
                result[mapping.source].push(attrs[mapping.source]);
            });
        });
        return result;
    }
}
exports.Extractor = Extractor;
