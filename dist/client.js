"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = Client;

function Client(config) {

    var _config = config;
    var _stack = [];

    init.bind(this)();

    function init() {
        _config.headers = _config.headers || {};
        _config.headers.accept = _config.headers.accept || 'application/json';

        var _arr = ["get", "post", "put", "patch", "delete"];
        for (var _i = 0; _i < _arr.length; _i++) {
            var method = _arr[_i];
            createMethod.bind(this)(method);
        }
    }

    function createMethod(method) {
        this[method] = function () {
            return send.apply(undefined, [method.toUpperCase()].concat(Array.prototype.slice.call(arguments)));
        };
    }

    function send(method, uri) {
        var request = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        request = configure(request, method, uri);

        hooks("before", "all", request);
        hooks("before", method, request);
        addToStack([handle]);
        hooks("after", "all", request);
        hooks("after", method, request);
        return callStack(request);
    }

    function handle(request) {
        return _config.backend.handle(request);
    }

    function configure(request, method, uri) {
        request.method = method;
        request.uri = _config.host + uri;
        request.headers = request.headers || {};
        request.headers.Accept = _config.headers.accept;

        if (request.body) {
            request.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        return request;
    }

    function hooks(state, method) {
        if (_config.hooks && _config.hooks[state] && _config.hooks[state][method]) {
            addToStack(_config.hooks[state][method]);
        }
    }

    function addToStack(operations) {
        var _stack2;

        _stack = (_stack2 = _stack).concat.apply(_stack2, _toConsumableArray(operations));
    }

    function callStack(request) {
        var next = function next() {
            if (_stack.length > 0) {
                var operation = _stack.shift();
                return operation(request, next);
            }
        };

        return next(next);
    }
}