var Client = require("../src/index.js");
var backend = require("resst-fetch");


var client = new Client({
    "host": "http://localhost:8080/api",
    "backend": backend,
    "hooks": {
        "before": [accessToken, getCSRFToken],
        "after": [consoleLog1, getJsonData, consoleLog2]
    }
});


function consoleLog1(transaction, next){
    console.log("ConsoleLog1 Function")
    console.log(transaction.response)
    console.log("-------------------")
    return next();
}


function consoleLog2(transaction, next){
    console.log("ConsoleLog2 Function")

    console.log("-------------------")
    return next();
}

function accessToken(transaction, next){
    transaction.request.headers["Access-Token"] = "yolo";
    return next();
}



function getJsonData(transaction, next){
  var data;
  
  if(transaction.response.body){
    try{
      data = JSON.parse(transaction.response.body);
    } catch(exception) {
      data = {error: "Could not read response", exception: exception}
    }
  } else {
    data = {error: "Not data returned"}
  }

  transaction.response.data = data

  return next();
}


function getCSRFToken(transaction, next){

    if(transaction.request.method === "GET"){
        return next();
    }

    return client.get("/security/token")
      .then(function(subTransaction) {
        console.log(subTransaction);
        transaction.request.body += "&_csrf="+subTransaction.response.data.value; 
        return next();
    });
}


var foo = client.get("/users/42").then( (data) => console.log(data));



client.post("/account/login", {
    "body": "login=username&password=password"
    })
    .then(console.log, console.warn);
