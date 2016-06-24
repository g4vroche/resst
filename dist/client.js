"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = Client;

function Client(config) {

    var _config = {
        hooks: {
            before: [],
            after: []
        },
        headers: {
            accept: 'application/json'
        }
    };

    var _request = {
        headers: {
            accept: _config.headers.accept
        }
    };

    init.bind(this)(config);

    /**
     * Init client with global properties,
     * Dynamically generate RESTFul methods
     */
    function init(config) {
        var _this = this;

        _config = Object.assign(_config, config);

        ["get", "post", "put", "patch", "delete"].map(function (method) {
            return createMethod.bind(_this)(method);
        });
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
        request = Object.assign({}, _request, request, {
            method: method,
            uri: _config.host + uri
        });

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