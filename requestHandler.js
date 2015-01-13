var fs = require("fs");
var formidable = require("formidable");
var request = require('request');
var url = require('url');

global.sessionID = "";

function start(response) {

    console.log('requestHandler.js start function');
    login();
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" ' +
        'content="text/html; charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<form action="/upload" enctype="multipart/form-data" ' +
        'method="post">' +
        '<input type="file" name="upload">' +
        '<input type="submit" value="Upload file" />' +
        '</form>' +

            //query a value
        '<form action="/fhir/patient" enctype="multipart/form-data" ' +
        'method="get">' +
        '<input type="text" name="identifier">' +
        '<input type="submit" value="query" />' +
        '</form>' +
        '</body>' +
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {

    console.log('this is upload function in requestHandler');
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        fs.renameSync(files.upload.path, "./tmp/test.json");

        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("<h1>Data uploaded are:</h1><br/>");
        response.write("<iframe src='/show' />");  // set the text area
        response.end();
        console.log('this is a sleep time')
    })
}

//the data handle is in the show function here
function show(response) {
    console.log('this is show function in requestHandler');
    fs.readFile("./tmp/test.json", "utf-8", function (error, file) {
        if (error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            //call postfile here to upload the data
            postFile(file);

            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(file, "utf-8");
            response.end();
        }
    });
}

//get the session Id
function login() {
    console.log('this is login function in requestHandler');
    request
        .post('https://rest.ehrscape.com/rest/v1/session?username=handi&password=RPEcC859',
        function (error, response, body) {
            if (!error && response.statusCode == 201) {
                //get the sessionID
                var pos = body.lastIndexOf("sessionId");
                global.sessionID = body.slice(pos + 12, pos + 48);
                console.log("the session id is " + global.sessionID);
            }
        })
}

function postFile(file) {

    console.log('this is postfile function in requestHandler');

    //console.log('the file is ' + file);
    //console.log('the type of file is ' + typeof (JSON.stringify(file)));
    var options = {
        method: 'POST'
        , url: 'https://rest.ehrscape.com/rest/v1/demographics/party'
        , body: JSON.parse(file)//only need a raw json string   if read a file, must transfer the file to a js objct
        , auth: {
            'user': 'handi',
            'pass': 'RPEcC859',
            'sendImmediately': false
        }
        , json: true
        , encoding: 'utf8'
        , headers: {
            'Content-type': 'application/json',
            "Ehr-Session": global.sessionID
        }
    };
    request(options, function (error, response, body) {
            console.log("postfile's callback function of postfile");
            if (!error && response.statusCode == 201) {
                console.log('the result is :' + response.statusCode);
            } else {
                console.log('response status code: ' + response.statusCode);
            }
        }
    );

}

function query(response, requeststr) {
    console.log('this is query function in requestHandler');

    var queryStr = url.parse(requeststr.url).query;
    var queryPar = queryStr.slice(11, queryStr.length);

    console.log('the query string is: ' + queryPar);

    var queryArray = [{"key": "identifier", "value": queryPar}];

    var options = {
        method: 'POST'
        , url: 'https://rest.ehrscape.com/rest/v1/demographics/party/query'
        , body: queryArray//the request body  array only in raw data is ok
        , auth: {
            'user': 'handi',
            'pass': 'RPEcC859',
            'sendImmediately': false
        }
        , json: true
        , encoding: 'utf8'
        , headers: {
            'Content-type': 'application/json',
            "Ehr-Session": global.sessionID
        }
    };

    var result = "";
    request(options, function (error, response, body) {
            console.log('till requerst is right');

            if (!error && response.statusCode == 200) {

                console.log('the response status code is : ' + response.statusCode);
                console.log('the body is' + JSON.stringify(body));
                result = JSON.stringify(body);
            } else {
                console.log('response status code: ' + response.statusCode);
            }
        }
    );

    setTimeout(function () {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("<h1>Data you queried are:</h1><br/>");
        response.write("the response is :" + result, "utf-8");  // set the text area
        response.end();
    }, 3000);


}

exports.start = start;
exports.upload = upload;
exports.show = show;
exports.query = query;