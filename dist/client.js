"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = Client;

function Client(config) {

    var _config;

    init.bind(this)(config);

    /**
     * Init client with global properties,
     * set some default.
     * Dynamically generate RESTFul methods
     */
    function init(config) {
        _config = config;
        _config.headers = _config.headers || {};
        _config.headers.accept = _config.headers.accept || 'application/json';

        var _arr = ["get", "post", "put", "patch", "delete"];
        for (var _i = 0; _i < _arr.length; _i++) {
            var method = _arr[_i];
            createMethod.bind(this)(method);
        }
    }

    /*
     * RESTFul method creation
     * In it's own function for variable scope purpose
     */
    function createMethod(method) {
        this[method] = function () {
            return send.apply(undefined, [method.toUpperCase()].concat(Array.prototype.slice.call(arguments)));
        };
    }

    /**
     * Init the request object with some default
     * or settings from the global configuration
     */
    function initRequest(request, method, uri) {
        request.method = method;
        request.uri = _config.host + uri;
        request.headers = request.headers || {};
        request.headers.Accept = _config.headers.accept;

        if (request.body) {
            request.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        return request;
    }

    /**
     * Actual Transaction handler
     * Build the stack of operations to run
     */
    function send(method, uri) {
        var request = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var transaction = {
            request: initRequest(request, method, uri),
            response: null
        };

        var _stack = [].concat(_toConsumableArray(_config.hooks.before), [handle], _toConsumableArray(_config.hooks.after), [function (transaction) {
            return transaction;
        }]);

        return callStack(_stack, transaction);
    }

    /**
     * Send the transaction to backend
     * and bind response to transaction object when done
     */
    function handle(transaction, next) {
        return _config.backend.handle(transaction.request, function (response) {
            transaction.response = response;
            return next();
        });
    }

    /**
     * Execute synchronously the list of operations
     * (middlewares like function)
     */
    function callStack(_stack, transaction) {

        var next = function next() {
            if (_stack.length > 0) {
                var operation = _stack.shift();
                return operation(transaction, next);
            }
        };

        return next(next);
    }
}