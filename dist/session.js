var Chinchilla;
(function (Chinchilla) {
    var Session = (function () {
        function Session() {
            if (Session._instance)
                throw new Error('Error: Instantiation failed. Use Session.getInstance() instead');
            Session._instance = this;
        }
        Session.getInstance = function () {
            return Session._instance;
        };
        Session.prototype.getSessionId = function () {
            return 'foo';
        };
        Session._instance = new Session();
        return Session;
    })();
    Chinchilla.Session = Session;
})(Chinchilla || (Chinchilla = {}));
