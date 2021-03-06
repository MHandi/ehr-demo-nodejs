var sessionId;
var demogSessionId;
var ehrId;
var demographicsBaseUrl = "https://rest.ehrscape.com/rest/v1";
var marandBaseUrl = "https://rest.ehrscape.com/rest/v1";
var oceanBaseUrl = "http://ocean-db.cloudapp.net";
var marandSessionId;
var oceanSessionId;

var baseUrl;

var baseItsNodeUrl = "http://www.itserver.es:9080/ITSNode";
var composer ="Dr Louise Jones";
var commiter ="Dr Louise Jones";

//  Standard HANDI-HOPD domain
var username = 'handi';
var password = 'RPEcC859';

//  Standard HANDI-HOPD domain
var itsUsername = 'handihopd';
var itsPassword = 'dfg58pa';


$(document).ready(function () {

    var aqlStatement;
    aqlStatement = "select \
            a_b/items[at0001]/value/value as medName,\
            a_b/items[at0001]/value/defining_code/code_string as medCode,\
            a_b/items[at0001]/value/defining_code/terminology_id/value as CodeTerminology,\
            a_b/items[at0001]/value/mappings[terminology_id = 'dm+d']/target/code_string as MappingCode,\
            a_b/items[at0001]/value/mappings[terminology_id = 'dm+d']/target/terminology_id/value as MappingCodeTerminology,\
            a_b/items[at0019]/items[at0003]/value/value as medDose,\
            m_s/items[at0070, 'Last issued']/items[at0047]/value/value as lastIssueDate\
        from EHR e \
        contains COMPOSITION a \
            contains  \
                        INSTRUCTION a_a[openEHR-EHR-INSTRUCTION.medication_order_uk.v1]\
                            contains \
                                (\
                                 CLUSTER a_b[openEHR-EHR-CLUSTER.medication_item.v1]\
                                 and\
                                 CLUSTER m_s[openEHR-EHR-CLUSTER.medication_status.v1]\
                                 )\
                 \
        where m_s/items[at0030]/value/defining_code/code_string='at0033'";

//    Standard shn_gp domain
//    var username = 'shn_gp';
//    var password = 'calmfish41';


//  Dummy patient Medresca Wurst
//  var ehrId = "a3f30697-1223-473e-bd4b-0f72e64d7a24";
//  var nhsNumber = "746";

// Other dummy patients
// var ehrId = "168f8b85-f70c-4342-ab42-51856cf1be14";
// var ehrId = "879be82a-0a15-44fd-95c3-cef42f9560c3";

// var ProceduresehrId = "ed26e420-abae-49ac-8d84-415a247814f7";

// Basic HOPD API calls


    function ehrLogin(ehrBaseUrl) {
        return $.ajax({
            type: "POST",
            url: ehrBaseUrl + "/session?" + $.param({username: username, password: password}),
            success: function (res) {
                sessionId = res.sessionId;
                if (ehrBaseUrl == marandBaseUrl)
                {
                    marandSessionId = sessionId
                }
                else
                {
                    oceanSessionId = sessionId;
                }
            }
        });
    }

    function ehrLogout(ehrBaseUrl) {
        return $.ajax({
            type: "DELETE",
            url: ehrBaseUrl + "/session",
            headers: {
                "Ehr-Session": sessionId
            }
        });
    }

    function demogLogin() {
        return $.ajax({
            type: "POST",
            url: demographicsBaseUrl + "/session?" + $.param({username: username, password: password}),
            success: function (res) {
                demogSessionId = res.sessionId;
            }
        });
    }

    function demogLogout() {
        return $.ajax({
            type: "DELETE",
            url: demographicsBaseUrl + "/session",
            headers: {
                "Ehr-Session": demogSessionId
            }
        });
    }

    function getPatientEhr(nhsNumber,ehrBaseUrl) {
        return $.ajax({
            url: ehrBaseUrl + "/ehr/?" + $.param({subjectId: nhsNumber, subjectNamespace:'ehscape'}),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (data) {
                var party = data;
                ehrId = party.ehrId
                //   ehrId = ProceduresehrId;
            },
            error: function(){alert('Service :' + ehrBaseUrl + 'EHRId for Patient NHS Number '+ nhsNumber +' not found');}

        });
    }




    function postProfile() {
        var ehrObj ={
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

                    } ,
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
            }


            ;

        /*
         * some errors happened:
         * 1. http error: content type is not parsed by server. solutions: set 'contentTpe' for required type
         * 2. bad request 400: set JSON type.
         * */
        return $.ajax({
            url: "https://rest.ehrscape.com/rest/v1/demographics/party",
            type: 'POST',
            data: JSON.stringify(ehrObj),
            contentType: "application/json; charset=ISO-8859-1",
            headers: {
                "Ehr-Session": demogSessionId

            },
            success: function (response) {
                console.log("EHR POST response is successful :");
            },
            error: function (response) {

                console.log('Bad POST request  message is ' + response.response);
            }

        });

    }

    document.getElementById("btnQuery").addEventListener("click", queryProfile);
    function queryProfile() {
        var inputNHS=$('#iptNHS').val();

        console.log("input's type is "+  typeof (inputNHS.toString()));
        var queryArray =
            [ {
                "key": "label",
                "value": "uk.nhs.nhsnumber"
                }
                ,
                {
                    "key": "system",
                    "value": "NHS"

                } ,

                {
                    "key": "value",
                    "value": inputNHS.toString()
                }
            ];


        console.log(typeof (queryArray));
        return $.ajax({
            url: "https://rest.ehrscape.com/rest/v1/demographics/party/query",
            type: 'POST',
            data: JSON.stringify(queryArray),
            contentType: "application/json; charset=ISO-8859-1",
            headers: {
                "Ehr-Session": demogSessionId
            },
            success: function (response) {
                console.log("QUERY POST response is successful");
                document.getElementById("showResult").innerHTML = JSON.stringify(response.parties);
            },
            error: function (response) {
                console.log('QUERY : Bad request ');
            }

        });
    }

// Get Patient Demographics details from Marand ehrScape 'Party' service
// In a UK setting this may actually be a Spine Mini service call ? with FHIR wrapper
    function getPatientDemographics(nhsNumber) {
        return $.ajax({
            //      url: demographicsBaseUrl + "/demographics/ehr/" + ehrId + "/party",
            url: demographicsBaseUrl + "/demographics/party/" + nhsNumber ,
            type: 'GET',
            headers: {
                "Ehr-Session": demogSessionId
            },
            success: function (data) {
                var party = data.party;
                // Name
                $("#patient-name").html(party.firstNames + ' ' + party.lastNames);
                // NHS Number
                $("#patient-number").html(party.id);

                // Complete age
                var age = getAge(formatDateUS(party.dateOfBirth));
                $(".patient-age").html(age);

                // Date of birth
                $(".patient-dob").html(formatDate(party.dateOfBirth));

                // Age in years
                $(".patient-age-years").html(getAgeInYears(party.dateOfBirth));

                // Gender
                var gender = party.gender;
                $("#patient-gender").html(gender.substring(0, 1) + gender.substring(1).toLowerCase());

                // Address
                var gender = party.gender;
                $("#patient-address").html(party.address.address);

                // Patient's picture
                var imageUrl;
                if (party.hasOwnProperty('partyAdditionalInfo')) {
                    party.partyAdditionalInfo.forEach(function (el) {
                        if (el.key === 'image_url') {
                            imageUrl = el.value;
                        }
                    });
                }
                if (imageUrl !== undefined) {
                    $('.patient-pic').css('background', 'url(' + imageUrl + ')');
//                } else {
//                    $('.patient-pic').css('background', 'url(../img/female.png) center no-repeat');
                }
            },
            error: function(){alert('Patient ' + ehrId + ' not found');}

        });
    }

    function getclinicianDemographics() {
        // Dummy function to populate clinician details
        $("#clinician-name").html(composer);

    }

    // Formats AQL statement
    function formatPatientQuery(aqlstring) {
        return "/query/?aql=" + encodeURIComponent(aqlstring.replace("EHR e" , "EHR e [ehr_id ='"+ ehrId +"'] "));
    }

    function getUKAllergies(ehrBaseUrl) {

        aqlStatement = "select\
            a/uid/value as uid,\
            a_a/data[at0001]/items[at0025]/items[at0021]/value as Date_recorded,\
            a_a/data[at0001]/items[at0002]/value as Causative_agent,\
            a_a/data[at0001]/items[at0002]/value/mappings/target as mappingCode\
        from EHR e\
        contains COMPOSITION a\
        contains EVALUATION a_a[openEHR-EHR-EVALUATION.adverse_reaction_uk.v1]";
        return $.ajax({
            url: ehrBaseUrl + formatPatientQuery(aqlStatement),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                for (var i = 0; i < res.resultSet.length; i++) {
                    $('ul.allergies'+ serverSuffix(ehrBaseUrl)).append('<li>'
                    + formatDate(res.resultSet[i].Date_recorded.value,false) + ' - ' + res.resultSet[i].Causative_agent.value
                    +  '<br>'
                    + 'Code: ' + res.resultSet[i].mappingCode.code_string
                    + '</li>');
                }
            },
            error: function(){alert('fail');}

        });
    }

    function getUKProcedures(ehrBaseUrl) {

        aqlStatement = "select \
            proc/time/value as dateTime,\
            proc/description[at0001]/items[at0005]/value/value as comment,\
            proc/description[at0001]/items[at0002]/value/value as procedureName,\
            proc/description[at0001]/items[at0002]/value/defining_code as ReadCode, \
            proc/description[at0001]/items[at0002]/value/mappings/target[terminology_id = 'SNOMED-CT'] as SnomedCode \
        from EHR e\
        contains COMPOSITION a\
        contains ACTION proc[openEHR-EHR-ACTION.procedure.v1]";

        return $.ajax({
            url: ehrBaseUrl + formatPatientQuery(aqlStatement),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                for (var i = 0; i < res.resultSet.length; i++) {
                    $('ul.procedures'+ serverSuffix(ehrBaseUrl)).append(
                        '<li>'
                        + formatDate(res.resultSet[i].dateTime,false)
                        + ' - ' + res.resultSet[i].procedureName
                        +'<br>'
                        + " READ: " + res.resultSet[i].ReadCode.code_string
                        + " SNOMED: " +res.resultSet[i].SnomedCode.code_string
                        + '</li>');
                }
            },
            error: function(){alert('fail');}

        });
    }

    function getUKImmunisations(ehrBaseUrl) {

        aqlStatement = "select\
            a_a/description[at0001]/items[at0002]/value/value as immunisationName,\
            a_a/description[at0001]/items[at0015]/value/value as Comment,\
            a_a/description[at0001]/items[at0002]/value/defining_code as ReadCode, \
            a_a/description[at0001]/items[at0002]/value/mappings/target[terminology_id = 'SNOMED-CT'] as SnomedCode, \
            a_a/time as time\
        from EHR e\
        contains COMPOSITION a\
        contains ACTION a_a[openEHR-EHR-ACTION.immunisation_procedure.v1]";

        return $.ajax({
            url: ehrBaseUrl + formatPatientQuery(aqlStatement),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                for (var i = 0; i < res.resultSet.length; i++) {
                    $('ul.immunisations'+ serverSuffix(ehrBaseUrl)).append(
                        '<li>'
                        + formatDate(res.resultSet[i].time.value,false)
                        + ' - ' + res.resultSet[i].immunisationName
                        +' <br>'
                        + " READ: " + res.resultSet[i].ReadCode.code_string
                        + " SNOMED: " +res.resultSet[i].SnomedCode.code_string
                        + '</li>');
                }
            },
            error: function(){alert('fail');}

        });
    }

    function serverSuffix(pEhrBaseUrl) {
        if (pEhrBaseUrl == marandBaseUrl)
        {
            return "_m"
        }
        else
        {
            return "_o"
        }
    }

    function getUKMedications(ehrBaseUrl) {

        aqlStatement = "select \
            a/uid/value as uid,\
            a_b/items[at0001]/value/value as medName,\
            a_b/items[at0001]/value/defining_code/code_string as medCode,\
            a_b/items[at0001]/value/defining_code/terminology_id/value as CodeTerminology,\
            a_b/items[at0001]/value/mappings/target[terminology_id = 'dm+d']/code_string as dmdCode,\
            a_b/items[at0019]/items[at0003]/value/value as medDose,\
            m_s/items[at0070, 'Last issued']/items[at0047]/value/value as lastIssueDate\
        from EHR e \
            contains COMPOSITION a \
            contains (INSTRUCTION a_a[openEHR-EHR-INSTRUCTION.medication_order_uk.v1]\
            contains \
                CLUSTER a_b[openEHR-EHR-CLUSTER.medication_item.v1]\
                   and\
                CLUSTER m_s[openEHR-EHR-CLUSTER.medication_status.v1])\
        where m_s/items[at0030]/value/defining_code/code_string='at0033'";

        return $.ajax({
            url: ehrBaseUrl + formatPatientQuery(aqlStatement),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                for (var i = 0; i < res.resultSet.length; i++) {
                    var linestring = res.resultSet[i].medName +  " " + res.resultSet[i].medDose + " - Last issued: " + formatDate(res.resultSet[i].lastIssueDate,false);
                    $('ul.medications'+ serverSuffix(ehrBaseUrl)).append('<li> '+ linestring + ' </li>');
                }
            },
            error: function(){alert('fail');}
        });
    }


    function displayAQLStatement() {

        var formatter = new AqlFormatter();
        var formatted = formatter.formatAql(aqlStatement);
        formatter.highlightAql(formatted, document.getElementById("aqlstatement"));
    }

    function displayAQLResultset(ehrBaseUrl) {
        return $.ajax({
            url: ehrBaseUrl + formatPatientQuery(aqlStatement),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
                //    "Accept": 'text/xml'
            },
            success: function (res) {
                var formatter = new AqlFormatter();
                formatter.highlightJson(JSON.stringify(res.resultSet, undefined,2), document.getElementById("aqlresultset"+serverSuffix(ehrBaseUrl)));
            },
            error: function(){alert('fail');}

        });
    }

    function getUKProblems(ehrBaseUrl) {
        var aqlStatement = "select\
            a_a/data[at0001]/items[at0002]/value/value as ProblemName,\
            a_a/data[at0001]/items[at0003]/value as Date_of_Onset,\
            a_a/data[at0001]/items[at0002]/value/defining_code as ReadCode, \
            a_a/data[at0001]/items[at0002]/value/mappings/target[terminology_id = 'SNOMED-CT'] as SnomedCode \
                from EHR e\
                contains COMPOSITION a\
                contains EVALUATION a_a[openEHR-EHR-EVALUATION.problem_diagnosis.v1]";

        return $.ajax({
            url: ehrBaseUrl  + formatPatientQuery(aqlStatement),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                for (var i = 0; i < res.resultSet.length; i++) {
                    $('ul.problems'+serverSuffix(ehrBaseUrl) +
                    '').append('' +
                    '   <li>'
                    + formatDate(res.resultSet[i].Date_of_Onset.value,false) + "- " + res.resultSet[i].ProblemName
                    + "<br/>"
                    + " READ: " + res.resultSet[i].ReadCode.code_string
                    + "  SNOMED: " +res.resultSet[i].SnomedCode.code_string);
                }
            },
            error: function(){alert('fail');}

        });
    }



    function getWebTemplates() {
        return $.ajax({
            url: marandBaseUrl + "/template",
            type: 'GET',
            headers: {
                "Ehr-Session": marandSessionId
            },
            success: function (data) {
                $("#webTemplates").empty();
                $("#webTemplates2").empty();
                $.each(data.templates, function (key, value) {
                    $("#webTemplates").append("<option>" + value.templateId + "</option>");
                    $("#webTemplates2").append("<option>" + value.templateId + "</option>");
                });
            },
            error: function () {
                alert('Web templates not found');
            }

        });
    }

    function accessEhr(ehrBaseUrl) {
        ehrLogin(ehrBaseUrl).done(function () {
            getPatientEhr(nhsNumber,ehrBaseUrl).done(function () {
                $.when(
                    getUKProblems(ehrBaseUrl),
                    getUKMedications(ehrBaseUrl),
                    getUKAllergies(ehrBaseUrl),
                    getUKProcedures(ehrBaseUrl),
                    getUKImmunisations((ehrBaseUrl),
                        displayAQLStatement(),
                        displayAQLResultset(ehrBaseUrl),
                        getWebTemplates()
                    )
                ).then(demogLogout())
            });
        });
    }



// display page
    var nhsNumber = "746"
    demogLogin().done(function () {
        //getPatientDemographics(nhsNumber),
          //  getclinicianDemographics(),
            //accessEhr(marandBaseUrl)
        //accessEhr(oceanBaseUrl)
        postProfile();

    });


});

function getWebTemplateExample() {
    var e = document.getElementById("webTemplates");
    var templateId = e.options[e.selectedIndex].text;
    var format = "STRUCTURED";
    return $.ajax({
        url: marandBaseUrl + "/template/"+templateId+"/example/?" + $.param({format: format}),
        type: 'GET',
        headers: {
            "Ehr-Session": marandSessionId
        },
        success: function (data) {
            $('pre.web_template_example_result').html(JSON.stringify(data, undefined, 2));
        },
        error: function(){
            alert('Web Template '+ templateId +' not found');
        }

    });
}


function postComposition() {
    var e = document.getElementById("webTemplates");
    var templateId = e.options[e.selectedIndex].text;
    var format = "STRUCTURED";
    var compositionData ={"ctx/language": "en",
        "ctx/territory": "GB",
        "ctx/composer_name": composer,
        "ctx/time": "2014-10-08T00:59:53.627+02:00",
        "ctx/id_namespace": "NHSEngland",
        "ctx/id_scheme": "NHSNumber",
        "ctx/health_care_facility|name": "St James Hospital, Leeds",
        "ctx/health_care_facility|id": "9091",
        "oncology_diagnosis": {
            "problem_diagnosis": [
                {
                    "problem_diagnosis": [
                        {
                            "|code": "254837009",
                            "|value": "Breast cancer",
                            "|terminology": "SNOMEDCT"
                        }
                    ],
                    "description": [
                        "Patient not aware of diagnosis."
                    ],
                    "body_site": [
                        {
                            "|code": "80248007",
                            "|value": "Left breast ",
                            "|terminology": "SNOMEDCT"
                        }
                    ]

                }
            ]
        }
    }

    return $.ajax({
        url: marandBaseUrl + "/composition/?"
        + $.param({
            ehrId: ehrId,
            templateId: templateId,
            format: format,
            commiterName: encodeURIComponent(commiter)
        }),
        type: 'POST',
        headers: {
            "Ehr-Session": marandSessionId
        },
        contentType: 'application/json',
        data: JSON.stringify(compositionData),
        success: function (data) {
            alert('Post Composition '+ templateId +' succeeded.');
        },
        error: function()
        {
            alert('Post Composition '+ templateId +' failed.');
        }
    });
}

function getITSSnomedMatches() {
    var sctMatch = $("#txtTermSearch").val();

    return $.ajax({

        type: 'GET',
        /*url: "http://www.itserver.es/ITServer/rest/snomedcore/lang/es/searchInSnomed/termToSearch/" + request.term + "/numberOfElements/110",*/
        url: baseItsNodeUrl + "/rest/codesystem/snomed%20ct/entities/?" + $.param({matchvalue: sctMatch}) + "&referencelanguage=" + "en" + "&filtercomponent=description&fuzzy=false",
        dataType: "json",
        beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Basic ' + btoa(itsUsername + ":" + itsPassword));
        },
        data: {},
        success: function (data) {

            $('pre.snomedLookupResults').html(JSON.stringify(data, undefined, 2));
        },
        error: function () {
            alert('Matching term for  "' + sctMatch + '" not found');
        }

    });
}

function getITSSnomedCTS(snomedID) {
    return $.ajax({

        type: 'GET',
        url:  baseItsNodeUrl + "/rest/cts2/codesystem/snomedcore/entity/170333009?referencelanguage=en",
        dataType: "json",
        beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Basic ' + btoa(itsUsername + ":" + itsPassword));
        },
        data: {},
        success: function (data) {

            $('pre.snomedLookup').append(JSON.stringify(data, undefined, 2));
        },
        error: function () {
            alert('Matching term for  "' + snomedID + '" not found');
        }

    });
}

function getITSSnomedTerm(snomedID) {
    return $.ajax({

        type: 'GET',
        // url: baseItsNodeUrl + "/rest/cts2/codesystem/snomedcore/entity/" + snomedID + "&referencelanguage=" + "en",
        url:  baseItsNodeUrl + "/rest/cts2/codesystem/snomedcore/entity/170333009?referencelanguage=en",
        dataType: "json",
        beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Basic ' + btoa(itsUsername + ":" + itsPassword));
        },
        data: {},
        success: function (data) {

            SCTterm = data.EntityDescriptionMsg.EntityDescription.classDescription.designation["core:value"];
            return SCTterm
        },
        error: function () {
            alert('Matching term for  "' + snomedID + '" not found');
        }

    });
}


