/// <reference path = "../../typings/uri-templates.d.ts" />
/// <reference path = "foo.ts" />
//declare var URITemplate:any;
require("uri-templates");
var Chinchilla;
(function (Chinchilla) {
    var Session = (function () {
        function Session() {
        }
        Session.prototype.setSessionDomain = function (domain) {
            jQuery('#foo');
            new Promise(function (resolve) {
                resolve('foo');
            });
            new URITemplate('//foo');
            new Chinchilla.Foo();
            this.domain = domain;
        };
        return Session;
    })();
    Chinchilla.Session = Session;
})(Chinchilla || (Chinchilla = {}));
