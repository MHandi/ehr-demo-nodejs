var http = require ('http');
var url = require('url');
var fs = require('fs');

function start(route, handle){
    function onRequest(request,response) {

        // got the url and stringify
        var pathname = url.parse(request.url).pathname;

        route(handle,pathname,response,request);
    }
    http.createServer(onRequest).listen(8888);
    console.log("Server has started");
}

exports.start=start;