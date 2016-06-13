var Client = require("../src/index.js");
var backend = require("../src/jquery-backend.js");


var client = new Client({
    "host": "http://localhost:9000/api",
    "backend": backend,
    "hooks": {
        "before": {
            "all": [accessToken],
            "POST": [getCSRFToken],
            "PUT": [getCSRFToken],
            "PATCH": [getCSRFToken],
            "DELETE": [getCSRFToken],
        }
    }
});

function accessToken(request, next){
    request.headers["Access-Token"] = "yolo";
    return next();
}

function getCSRFToken(request, next){
    return client.get("/security/token")
          .then(function(response) {

            request.body += "&_csrf="+response.data.value; 
            return next();
    });
}


var foo = client.get("/users/42").then(console.log, console.warn);



client.post("/account/login", {
    "body": "login=username&password=password"
    })
    .then(console.log, console.warn);