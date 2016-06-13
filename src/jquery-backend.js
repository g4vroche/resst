var request = require("jquery");

module.exports = {

    "handle": function(parameters){
        var params = parameters;
        params.type = parameters.method;
        params.cache = true;
        params.url = parameters.uri;
        params.data = params.body;

        return new Promise(function(resolve, reject){

            params.success = function(body, status, response){
                resolve(formatResponse(response));
            };

            params.error = function(response){
                reject(formatResponse(response));
            };


            request.ajax(params);
        });
    }
};


function formatResponse(response){

    return {
        "headers": parseHeaders(response.getAllResponseHeaders()),
        "status": {
            "code": response.status,
            "message": response.statusText
        },
        "body": response.responseText,
        "data": formatBody(response)
    };
}

function formatBody(response){
//    var contentType = response.getResponseHeader("Content-type");
//    if (contentType && contentType.split(";")[0] === "application/json") {
        return JSON.parse(response.responseText);
//    }
}

function parseHeaders(headerSting){
    var headers = {};
    headerSting.split("\r\n").map( function(line) {
        if(line.trim() !== ""){
            line = line.split(":");
            headers[line.shift().trim()] = line.join(":").trim();
        }
    });

    return headers;
}


