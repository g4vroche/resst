var request = require("request");

module.exports = {

    "handle": function(parameters){

        return new Promise(function(resolve, reject){

            request(parameters, function(err, response, body){
                if(err){
                    reject(formatResponse(response));
                } else {
                    resolve(formatResponse(response));
                }
            });
        });
    }
};


function formatResponse(response){
    return {
        "headers": response.headers,
        "status": {
            "code": response.statusCode,
            "message": response.statusMessage
        },
        "body": response.body,
        "data": formatBody(response)
    };
}

function formatBody(response){
    if (response.headers["content-type"] && response.headers["content-type"].split(";")[0] === "application/json") {
        return JSON.parse(response.body);
    }
}

