var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandler');

var handle = {};

handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/show"] =  requestHandlers.show;
handle["/fhir/patient"] = requestHandlers.query;

console.log("this is index.js");

server.start(router.route,handle);