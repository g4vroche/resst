# Resst

A simple yet powerful promises based REST API client with support for middlewares


## Quick Start

```javascript
const Resst = require("resst");
const backend = require("resst-fetch");

const api = new Resst({
    "host": "https://api.exemple.com/v1",
    "backend": backend,
});

api.get('/answers/42')
   .then(transaction => console.log(transaction))

```

## Core concepts

### Backend

The library itself can't fetch data, it relies on _backends_ to handle the HTTP communication.

Backends are small wrappers that provide a unified way for Resst to allow the use of different HTTP clients.
So far there are backends for :

* [jquery](https://github.com/g4vroche/resst-jquery): Easy and sure to use on client if your project already embed it
* [fetch](https://github.com/g4vroche/resst-fetch): The new native norm for Ajax calls, you will need a polyfill for older browser
* [request](https://github.com/g4vroche/resst-request): A popular lib for nodejs


### Transaction

Rather than sending a request object and receiving a separated response object, Resst rely on a top level object called `transaction` which contains both request and response. This gives more context and is more consistent with the nature of HTTP.

Structure of the transaction object: 

* request `object`
  * headers `object` (HTTP headers key value pairs)
  * body `string`
  * method `string` : HTTP method/verb, automatically set by according to the name of the called method
  * uri `string` Automatically set with the first argument of the called method
  * credentials `string` (`ommit` (default) | `same-origin` | `include`) according to [fetch specification](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials). Beware some backend wont' handle those parameters.
* response `object`
  * headers `object` (HTTP headers key value pairs)
  * status `object`
    * code `int`
    * message `string`
    * body `string`

Note that Resst doesn't process any body transformation for you (eg. JSON.parse), this is up to you but can be easily managed via middlewares.

### middlewares

Resst is very light and unopiniated but brings you the flexibility of middlewares.
There are two entrypoint for middlewares: 

* Before sending the request
* After receiving the response

A middleware function receives two parameters, `transaction` and the `next` function to continue the process.

#### Exemples middlewares

``` javascript

// Alter request
function addCustomHeader(transaction, next) {
  if (transaction.request.method === 'POST') { // can read current values
    transaction.headers['X-foo'] = 'bar'; // can alter request
  }
  return next();
}


// Alter response
function parseJSON(transaction, next) {
  if (transaction.response.headers['content-type'] === 'application/json') {
    transaction.response.data = JSON.parse(transaction.response.body;
  }
  return next();
}

// Middlewares are passed to the middlewares property
const api = new Resst({
    host: 'https://api.exemple.com/v1',
    backend: backend,
    middlewares: {
      before: [
        addCustomHeader,
      ],
      after: [
        parseJSON,
      ],
    }
});

// Exemple of addng middleware after instanciation
// Here a simple logger
api.apply('before', function(transaction, next){
  console.log('Request about to be sent');
  console.log(transaction.request);
  return next();
});

api.get('/answers/42')
   .then(transaction => console.log(transaction))


```

## Using the client

The client expose a method for get, post, put, patch, delete.

All these methods takes the same arguments (actually under the hood the same method is called with the HTTP verb already set).

* uri `string`
* request `object` _(optional)_ properties will be merged to create the final request object to be passed to middlewares. You can basically override any part of the request.

