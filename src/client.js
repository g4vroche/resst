module.exports = Client;

function Client(config){

    var _config = {
        middlewares: {
            before: [],
            after: [],
        },
        headers: {
            accept: 'application/json'
        }
    }

    var _request = {
        headers: {
            accept: _config.headers.accept
        }
    }

    init.bind(this)(config);

    /**
     * Init client with global properties,
     * Dynamically generate RESTFul methods
     */
    function init(config){
        // Backward compatibility
        if (config.hooks) {
            config.middlewares = config.hooks;
        }
        _config = Object.assign(_config, config);

        ["get", "post", "put", "patch", "delete"].map( method => 
            createMethod.bind(this)(method) 
        )
    }

    this.apply = function(hook, func) {
        _config.middlewares[hook].push(func);
    };

    /*
     * RESTFul method creation
     * In it's own function for variable scope purpose
     */
    function createMethod(method) {
        this[method] = function() { return send(method.toUpperCase(), ...arguments) }
    }

    /**
     * Init the request object with some default
     * or settings from the global configuration
     */
    function initRequest(request, method, uri){
        request = Object.assign({}, _request, request, {
            method: method,
            uri: _config.host + uri,
        })

        if (request.body){
            request.headers["Content-Type"] = "application/x-www-form-urlencoded"
        }

        return request
    }

    /**
     * Actual Transaction handler
     * Build the stack of operations to run
     */
    function send(method, uri, request = {}) {
        var transaction = {
            request: initRequest(request, method, uri),
            response: null
        }

        var _stack = [
            ..._config.middlewares.before,
            handle,
            ..._config.middlewares.after,
            (transaction) => transaction
        ]

        return callStack(_stack, transaction)
    }

    /**
     * Send the transaction to backend
     * and bind response to transaction object when done
     */
    function handle(transaction, next){
        return _config.backend.handle(transaction.request, (response) => {
            transaction.response = response
            return next()
        });
    }

    /**
     * Execute synchronously the list of operations
     * (middlewares like function)
     */
    function callStack(_stack, transaction){

        var next = function(){
            if (_stack.length > 0){
                var operation = _stack.shift()
                return operation(transaction, next)
            }
        }

        return next(next)
    }
}