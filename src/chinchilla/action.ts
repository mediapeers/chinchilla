/// <reference path = "../../typings/uriTemplate.d.ts" />
/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "config.ts" />
/// <reference path = "result.ts" />
/// <reference path = "context.ts" />
/// <reference path = "extractor.ts" />

declare var _;
declare var request;
declare var module;
declare var exports;

module Chinchilla {
  export class Action {
    ready: Promise<Result>;
    params: Object;
    options: any;
    body: Object;
    uriTmpl: UriTemplate;
    contextAction: ContextAction
    result: Result = new Result();

    constructor(contextAction: ContextAction, params = {}, body: any, options?: any) {
      this.contextAction  = contextAction;
      this.uriTmpl        = new UriTemplate(contextAction.template);
      this.params         = Extractor.uriParams(contextAction, params);
      this.options        = options;

      // reformat body to match rails API
      this.body = this.formatBody(body);

      this.ready = new Promise((resolve, reject) => {
        var uri = this.uriTmpl.fillFromObject(this.params);

        var req;
        switch (contextAction.method) {
          case 'GET':
            req = request.get(uri);
            break;

          case 'POST':
            req = request.post(uri)
              .send(this.body);
            break;

          case 'PUT':
            req = request.put(uri)
              .send(this.body);
            break;

          case 'PATCH':
            req = request.patch(uri)
              .send(this.body);
            break;

          case 'DELETE':
            req = request.del(uri);
            break;
        }

        // add timestamp
        req = req.query({ t: Config.timestamp })

        if (typeof !_.isUndefined(module) && module.exports) {
          req = req.timeout(10000)
        }

        // add session by default
        if (!options || !(options.withoutSession === true)) {
          req = req.set('Session-Id', Config.getSessionId());
        }

        // add custom headers
        if (options && (options.header || options.headers)) {
          let headers = options.headers || options.header;
        if (typeof headers === 'string')
          req.set(headers, 'true');
        else if (typeof headers === 'object')
          for (var key in headers)
            req.set(key, headers[key]);
        }

        req.end((err, res) => {
          if (err) {
            var error = new ErrorResult(err.response ? err.response.text : 'No error details available.').error(res);
            error.stack = err.stack;

            if (Config.errorInterceptor) {
              // if error interceptor returns true, then abort (don't resolve nor reject)
              if (Config.errorInterceptor(error)) return;
            }

            return reject(error);
          }

          this.result.success(res);
          resolve(this.result);
        });
      });
    }

    private formatBody(body) {
      if (_.isEmpty(body)) return;

      var formatted = {};

      if (this.options && (this.options.raw === true)) {
        formatted = this.cleanupObject(body);
      }
      else if (_.isArray(body)) {
        _.each(body, (obj) => {
          formatted[obj.id] = this.remapAttributes(this.cleanupObject(obj));
        });
      }
      else {
        formatted = this.remapAttributes(this.cleanupObject(body));
      }

      return formatted;
    }

    // cleans the object to be send
    // * rejects attributes starting with $
    // * rejects validation errors and isPristine attribute
    // * rejects js functions
    // * rejects empty objects {}
    // * rejects empty objects within array [{}]
    private cleanupObject(object) {
      if (_.isEmpty(object)) return {};

      var cleaned = {};
      _.each(object, (value, key) => {
        if (/^\$/.test(key) || key === 'errors' || key === 'isPristine' || _.isFunction(value)) {
          // skip
        }
        else if (_.isArray(value)) {
          if (_.isPlainObject(value[0])) {
            var subset = _.map(value, (x) => {
              return this.cleanupObject(x)
            });
            cleaned[key] = _.reject(subset, (x) => {
              return _.isEmpty(x)
            });
          }
          else {
            cleaned[key] = value;
          }
        }
        else if (_.isPlainObject(value)) {
          var cleanedValue = this.cleanupObject(value);
          if (!_.isEmpty(cleanedValue)) cleaned[key] = cleanedValue;
        }
        else {
          cleaned[key] = value;
        }
      });

      return cleaned;
    }

    private remapAttributes(object) {
      _.each(object, (value, key) => {
        // split csv string to array
        if (_.isString(value) && /_ids$/.test(key)) {
          var values = _.select(value.split(','), (item) => {
            return !_.isEmpty(item);
          });
          object[key] = values;
        }
        // append '_attributes' to nested objects (attributes that are an object or are an array of objects)
        else if (_.isPlainObject(value) || (_.isArray(value) && _.isPlainObject(_.first(value)))) {
          object[`${key}_attributes`] = value;
          delete object[key];
        }
      });
      return object;
    }
  }
}
