var http = require('http');
var url = require('url');
require("./myNode.js");

function start(route, handle) {
    function onRequest(request, response) {
        // got the url and stringify
        var pathname = url.parse(request.url).pathname;
        console.log('server.js start function and the requested pathname is '+ pathname);
        route(handle, pathname, response, request);
    }
    http.createServer(onRequest).listen(8888);
    console.log("Server has started");
}

exports.start = start;