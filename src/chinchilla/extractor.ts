/// <reference path = "../../typings/uriTemplate.d.ts" />
/// <reference path = "context.ts" />

declare var _;

module Chinchilla {
  export class Extractor {
    static extractMemberParams(context: Context, obj): Object {
      var action = context.memberAction('get');
      return Extractor.extractParams(action, obj);
    }

    static extractCollectionParams(context: Context, obj): Object {
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
    static uriParams(action: ContextAction, params = {}): Object {
      var uriParams = _.clone(params);
      _.each(action.mappings, (mapping) => {
        if (!uriParams[mapping.variable]) uriParams[mapping.variable] = params[mapping.source];
      });

      return uriParams;
    }

    private static extractParams(contextAction, obj): Object {
      if (_.isEmpty(obj) || _.isEmpty(contextAction)) return {};

      if (_.isArray(obj)) {
        return Extractor.extractArrayValues(contextAction, obj);
      }
      else {
        return Extractor.extractValues(contextAction, obj);
      }
    }

    private static extractValues(contextAction: ContextAction, object: any): Object {
      var id = object && object['@id'];

      if (!id) return {};

      var result    = {};
      var template  = new UriTemplate(contextAction.template);
      var values    = template.fromUri(id)

      if (_.isEmpty(values)) return {};

      _.each(contextAction.mappings, (mapping) => {
        var value = values[mapping.variable];
        if (!value) return;

        result[mapping.source] = value;
      });

      return result;
    }

    private static extractArrayValues(contextAction: ContextAction, objects: any): Object {
      var values = _.map(objects, (obj) => {
        return Extractor.extractValues(contextAction, obj);
      });

      values = _.compact(values);

      var result = {};

      _.each(contextAction.mappings, (mapping) => {
        result[mapping.source] = [];

        _.each(values, (attrs) => {
          if (!attrs[mapping.source]) return;
          if (_.include(result[mapping.source], attrs[mapping.source])) return;

          result[mapping.source].push(attrs[mapping.source]);
        });
      });

      return result;
    }

  }
}
