var fs = require("fs");
var formidable = require("formidable");
var request = require('request');

global.sessionID = "";

function start(response, request) {
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
        '<form action="/query" enctype="multipart/form-data" ' +
        'method="post">' +
        '<input type="text" name="query">' +
        '<input type="submit" value="query" />' +
        '</form>' +

        '</body>' +
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        fs.renameSync(files.upload.path, "./tmp/test.json");

        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("<h1>Data uploaded are:</h1><br/>");
        response.write("<iframe src='/show' />");  // set the text area
        response.end();
    })
}

//the data handle is in the show function here
function show(response) {
    fs.readFile("./tmp/test.json", "utf-8", function (error, file) {
        if (error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            //call postfile here to upload the data
            login();
            console.log("the file type is " +typeof (file));
            postFile(file);

            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(file, "utf-8");
            response.end();
        }
    });
}

//get the session Id
function login() {
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

    console.log('the file is ' + file);
    console.log('the type of file is ' + typeof (JSON.stringify(file)));
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


function query(){
    var queryArray = [ {"key": "label", "value": "NHS Number"}, {"key": "system", "value": "NHS"},{"key": "value", "value": inputNHS.toString()}];

    var options = {
        method: 'POST'
        , url: 'https://rest.ehrscape.com/rest/v1/demographics/party/query'
        , body: JSON.parse(queryArray)//only need a raw json string   if read a file, must transfer the file to a js objct
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
            console.log("query's callback function of postfile");
            if (!error && response.statusCode == 201) {
                console.log('the result is :' + response.statusCode);
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write("<h1>Data you wanted are:</h1><br/>");
                response.write("<iframe src='/result' />");  // set the text area
                response.end();
            } else {
                console.log('response status code: ' + response.statusCode);

            }
        }
    );

}

function result (response){

    fs.readFile("./tmp/test.json", "utf-8", function (error, file) {
        if (error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            //call postfile here to upload the data
            login();
            console.log("the file type is " +typeof (file));
            postFile(file);

            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(file, "utf-8");
            response.end();
        }
    });
}


exports.start = start;
exports.upload = upload;
exports.show = show;
exports.query = query;