/// <reference path = "chinchilla/subject.ts" />

window['chch'] = (objectsOrApp, model?) => {
  // detach from existing Subject first before creating a new one..
  objectsOrApp = Chinchilla.Subject.detachFromSubject(objectsOrApp);

  return new Chinchilla.Subject(objectsOrApp, model)
};

window['chch'].config = Chinchilla.Config;

window['chch'].new = function(app, model, attrs = {}) {
  return _.merge(
    { '@context': `${Chinchilla.Config.endpoints[app]}/context/${model}` },
    attrs
  );
};

window['chch'].contextUrl = function(app, model) {
  return `${Chinchilla.Config.endpoints[app]}/context/${model}`;
};

window['chch'].context = function(urlOrApp, model) {
  if (!model) {
    // assume first param is the context url
    return Chinchilla.Context.get(urlOrApp).ready;
  }
  else {
    return Chinchilla.Context.get(`${Chinchilla.Config.endpoints[urlOrApp]}/context/${model}`).ready;
  }
};

window['chch'].unfurl = function(app, model, actionName, params) {
  return new Promise(function(resolve, reject) {
    var page = 1;
    var result = { objects: [] };
    var subject = new Chinchilla.Subject(app, model);
    _.merge(params, { page: page });

    var fetch = function() {
      subject.$c(actionName, params)
        .then(function(pageResult) {
          page = page + 1;
          _.merge(params, { page: page });
          result.objects = result.objects.concat(pageResult.objects)

          if ((page <= 100) && (page <= (pageResult.headers && pageResult.headers['x-total-pages'] || 0))) {
            fetch();
          }
          else {
            resolve(result);
          }
        }, function() {
          reject(null);
        });
    };

    fetch();
  });
};
