module.exports = Client;

function Client(config){

    var _config = config;
    var _stack = [];

    init.bind(this)();

    function init(){
        _config.headers = _config.headers || {};
        _config.headers.accept = _config.headers.accept || 'application/json';

        for (var method of ["get", "post", "put", "patch", "delete"]) {
            createMethod.bind(this)(method);
        }
    }

    function createMethod(method) {
        this[method] = function() { return send(method.toUpperCase(), ...arguments); };
    }

    function send(method, uri, request = {}) {
        request = configure(request, method, uri);

        hooks("before", "all", request);
        hooks("before", method, request);
        addToStack([handle]);
        hooks("after", "all", request);
        hooks("after", method, request);
        return callStack(request);
    }

    function handle(request){
        return _config.backend.handle(request);
    }

    function configure(request, method, uri){
        request.method = method;
        request.uri = _config.host + uri;
        request.headers = request.headers || {};
        request.headers.Accept = _config.headers.accept;

        if ( request.body ){
            request.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        return request;
    }

    function hooks(state, method){
        if (_config.hooks && _config.hooks[state] && _config.hooks[state][method]){
            addToStack(_config.hooks[state][method]);
        }
    }

    function addToStack(operations) {
        _stack = _stack.concat(...operations);
    }

    function callStack(request){
        var next = function(){
            if (_stack.length > 0){
                var operation = _stack.shift();
                return operation(request, next);
            }
        };

        return next(next);
    }
}