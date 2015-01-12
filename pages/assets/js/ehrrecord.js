/**
 * Created by Yujie on 19/11/14.
 */

//  Standard HANDI-HOPD domain
var username = 'handi';
var password = 'RPEcC859';

$(document).ready(
function demogLogin() {
    return $.ajax({
        //var demographicsBaseUrl = "https://rest.ehrscape.com/rest/v1";
        type: "POST",
        url: "https://rest.ehrscape.com/rest/v1" + "/session?" + $.param({username: username, password: password}),
        success: function (res) {
            demogSessionId = res.sessionId;
            console.log("sessionId is "+demogSessionId);
        }
    });


    demogLogin.done(function(){

        console.log("ready for postprofile:");
        postProfile();

    });
    /*post fhir-ehr file to url*/
    function postProfile() {
        var ehrObj ={"id":"3279","version":0,"firstNames":"Smith","lastNames":"Nolan","gender":"MALE","dateOfBirth":"1990-03-09T00:00:00.000Z","address":{"id":"3279","version":0,"address":"Toronto, Canada"},"partyAdditionalInfo":[{"id":"3280","version":0,"key":"pet","value":"dog"},{"id":"3281","version":0,"key":"title","value":"Mr"}]};
        return $.ajax({
            //var marandBaseUrl = "https://rest.ehrscape.com/rest/v1";
            url: "https://rest.ehrscape.com/rest/v1/demographics/party?"  + $.param({username: username, password: password}),
            type: 'POST',
            headers: {
                "Ehr-Session": demogSessionId,
                Accept:"text/plain",
                ContentType:"application/json"

            },
            success: function (response) {
                console.log("EHR POST response is successful :");
            },
            error: function (response) {

                console.log('Bad POST request  message is '+response.response);
            }

        });

    }

}

)





