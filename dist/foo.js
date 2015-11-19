/// <reference path = "../../typings/tsd.d.ts" />
var Chinchilla;
(function (Chinchilla) {
    var Foo = (function () {
        function Foo() {
        }
        Foo.prototype.bar = function (domain) {
            return 'bar';
        };
        return Foo;
    })();
    Chinchilla.Foo = Foo;
})(Chinchilla || (Chinchilla = {}));
