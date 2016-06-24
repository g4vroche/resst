"use strict";

var jQuery = require('jquery');

module.exports = {

    "handle": function handle(request, modifier) {
        var params = Object.assign({}, request, {
            type: request.method,
            cache: true,
            url: request.uri,
            data: request.body
        });

        return new Promise(function (resolve, reject) {

            params.success = function (body, status, response) {
                resolve(modifier(formatResponse(response)));
            };

            params.error = function (response) {
                reject(modifier(formatResponse(response)));
            };

            jQuery.ajax(params);
        });
    }
};

function formatResponse(response) {

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

function formatBody(response) {
    //    var contentType = response.getResponseHeader("Content-type");
    //    if (contentType && contentType.split(";")[0] === "application/json") {
    return JSON.parse(response.responseText);
    //    }
}

function parseHeaders(headerSting) {
    var headers = {};
    headerSting.split("\r\n").map(function (line) {
        if (line.trim() !== "") {
            line = line.split(":");
            headers[line.shift().trim()] = line.join(":").trim();
        }
    });

    return headers;
}