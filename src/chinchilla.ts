/// <reference path = "chinchilla/subject.ts" />

window['chch'] = (objectsOrApp, model?) => {
  return new Chinchilla.Subject(objectsOrApp, model)
};

window['chch'].config = Chinchilla.Config;
