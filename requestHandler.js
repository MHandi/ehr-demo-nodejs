//var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");
var request = require('request');
var async = require('async');



function start(response, postData) {
    //console.log("Request handler 'start' was called");
    //fs.readFile("./pages/index.html", "binary", function (error, file) {
    //    if (error) {
    //        response.writeHead(500, {"Content-Type": "text/plain"});
    //        response.write(error + "\n");
    //        response.end();
    //    } else {
    //        response.writeHead(200, {"Content-Type": "text/html"});
    //        response.write(file, "binary");
    //        response.end();
    //    }
    //});
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
        '</body>' +
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {

    //console.log("Request handler 'upload' was called ");

    var form = new formidable.IncomingForm();

    form.parse(request, function (error, fields, files) {
        fs.renameSync(files.upload.path, "/Users/Yujie/Documents/test.json");
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("received data:<br/>");
        response.write("<iframe src='/show' />");  // set the text area
        response.end();
    })
    //call login function to get the session id////
   login();
}

function show(response) {
    //console.log("Request handler 'show' was called.");
    fs.readFile("/Users/Yujie/Documents/test.json", "binary", function (error, file) {
        if (error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(file, "binary");
            response.end();
        }
    });
}

function login() {
    var sessionId = "";
    request
        .post('https://rest.ehrscape.com/rest/v1/session?username=handi&password=RPEcC859',
        function (error, response, body) {
            if (!error && response.statusCode == 201) {
                //console.log('the body is ' + body);
                var pos = body.lastIndexOf("sessionId");

                sessionId = body.slice(pos + 12, pos + 48);
                console.log("the session id is " + sessionId);

            postfile(sessionId);
            }
        })
        //.on('response', function (response) {
        //    // unmodified http.IncomingMessage object
        //    response.on('data', function (data) {
        //        // compressed data as it is received
        //        //console.log('data type is ' + typeof (data));
        //        //console.log('received ' + data.length + ' bytes of compressed data');
        //        //console.log('data is ' + data );
        //    })
        //}


    return sessionId;

}

function postfile(sessionId) {
    console.log("postfile function is called");

    var ehrObj = {
        "firstNames": "Jonny",
        "lastNames": "Dalton",
        "gender": "MALE",
        "dateOfBirth": "2004-07-12T00:00:00.000Z",
        "address": {
            "address": "60 Florida Gardens, Garrowhill, West Yorkshire, LS23 4RT"
        },
        "partyAdditionalInfo": [
            {
                "key": "resourceType",
                "value": "Patient"
            }
            ,

            {
                "key": "label",
                "value": "NHS"
            }
            ,
            {
                "key": "system",
                "value": "NHS"

            },
            {
                "key": "value",
                "value": "7430444"

            }
            ,
            {

                "key": "title",
                "value": "Mr"
            }
            ,
            {
                "key": "system",
                "value": "http://hl7.org/fhir/v3/vs/AdministrativeGender"

            }
        ]
    };
    //var test = {"id":"3279","version":0,"firstNames":"Smith","lastNames":"Nolan","gender":"MALE","dateOfBirth":"1990-03-09T00:00:00.000Z","address":{"id":"3279","version":0,"address":"Toronto, Canada"},"partyAdditionalInfo":[{"id":"3280","version":0,"key":"pet","value":"dog"},{"id":"3281","version":0,"key":"title","value":"Mr"}]};
    var options  =  {
        method: 'POST'
        ,url: 'https://rest.ehrscape.com/rest/v1/demographics/party'
        ,body: ehrObj//only need a raw json string
        ,auth:{'user': 'handi',
               'pass': 'RPEcC859',
               'sendImmediately': false
                  }
        ,json: true
        ,encoding:'utf8'
        , headers: {
            'Content-type': 'application/json',
            //'content-type': 'application/json; charset=ISO-8859-1',
            "Ehr-Session": sessionId
        }
    };
    request(options,function (error, response, body) {
            console.log("postfile's callback function of postfile");
            if (!error &&response.statusCode == 201) {
                console.log('the result is :' + response.statusCode);
            } else {
                console.log('error: ' +error);
                console.log('body: ' +body);
                console.log('response status code: ' +response.statusCode);

            }
        }
    );

}


exports.start = start;
exports.upload = upload;
exports.show = show;