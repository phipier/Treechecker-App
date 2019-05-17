var obsform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        document.addEventListener("backbutton", onBackKeyDown, false);
        init_form();

        $('#photo').on('click', function() {
            navigator.camera.getPicture(
                function(imageData) {
                    $('#preview_text').remove();
                    var image = document.getElementById('image');
                    image.src = "data:image/jpeg;base64," + imageData;
                    window.sessionStorage.setItem("photo_image", "data:image/jpeg;base64," + imageData);
                },
                function() {
                    $("#errorpopupdata>p").html("");
                    $("#errorpopupdata>p").append("<p><i class='fas fa-exclamation-circle'></i> Error - There are problems with the camera. Try to take the photo again or restart the app.");
                    $('#errorpopupdata').modal('show');
                },
                {quality:50, destinationType:Camera.DestinationType.DATA_URL, correctOrientation: true}
            );
            return false;
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

obsform.initialize();

$("#cancelobs").click( function(e) {
    e.preventDefault();
    cancel_OBS();
    return false;
});

function onBackKeyDown() {
    cancel_OBS();    
}

function cancel_OBS() {    
    displayMessage("OBS creation canceled.", function() {clearWSitems(); window.location = "obs_list.html";});                
}

$("#saveobs").click( function(e) {
    e.preventDefault();    
    if ($("#OBS-form")[0].checkValidity() === false) {
        $("#OBS-form")[0].classList.add('was-validated');
        return false;
    } else {
        $("#OBS-form")[0].classList.add('was-validated');
    }
    if(!window.sessionStorage.getItem("photo")) {
        if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
            $("#errorpopupdata>p").html("");
        }
        $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - You cannot send an observation without attaching a photo.</p>");
        $('#errorpopupdata').modal('show');
    }
    setWSitems();
    insert_OBS(getWSitems());
    return false;
});

function insert_OBS(obs) {
    db.transaction(function(tx) {
        // ?? in order to keep ids unchanged, replace it with: 
        // INSERT OR IGNORE INTO obs (id, name) VALUES (myid, myname)
        // UPDATE obs SET name = "name" WHERE id=id_obs
        var sqlstr = 
            "REPLACE INTO surveydata(name, id_aoi, id_tree_species, id_crown_diameter, "
            + "id_canopy_status, comment, longitude, latitude) "
            + "VALUES('" + obs.name + "'," + obs.id_aoi + "," + obs.id_tree_species + "," + obs.id_crown_diameter + ","
            + obs.id_canopy_status + ",'" + obs.comment + "'," + obs.longitude + "," + obs.latitude + ");";

        tx.executeSql(sqlstr, [],
            function(tx, results) {
                var obsid = results.insertId;
                window.sessionStorage.setItem("obs_id", obsid);

                var sql =
                        "REPLACE INTO photo(id, id_survey_data, compass, image) "
                        + "VALUES(NULL, " + obsid + "," + obs.compass + ",'" + obs.photo + "');";

                    tx.executeSql(sql, [],
                        function(tx, res) {
                            window.sessionStorage.setItem("photo_id", res.insertId);
                        },
                        function(tx, error) {
                            console.log('ExecuteSQL Photo error: ' + error.message);
                        }
                    );
                }, function(error) {
                    console.log('Transaction PHOTO ERROR: ' + error.message);
                    if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
                        $("#errorpopupdata>p").html("");
                    }
                    $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - It was not possible to store the photos.</p>");
                    $('#errorpopup').modal('show');
                }, function() {
                    if(document.getElementById("successpopupdata").getElementsByTagName('p').length > 0) {
                        $("#successpopupdata>p").html("");
                    }
                    $("#successpopupdata").prepend("<p><i class='fas fa-smile'></i> Remote database updated.</p>");
                    $('#successpopup').modal('show');
                    clearWSitems();
                    window.location = 'obs_list.html';
            },
            function(tx, error) {
                console.log('ExecuteSQL Surveydata error: ' + error.message);
            }
        );
    }, function(error) {
        console.log('Transaction SURVEYDATA ERROR: ' + error.message);
        if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
            $("#errorpopupdata>p").html("");
        }
        $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - It was not possible to store the survey data.</p>");
        $('#errorpopup').modal('show');
    }, function() {
        console.log("transaction ok");
    });
}

$("#selectposition").click( function(e) {
    e.preventDefault();     
    setWSitems();
    window.location = 'obs_map.html';    
    return false; 
} );

function setWSitems() {
    window.sessionStorage.setItem("obs_name",               $("#InputOBSname").val().trim());
    window.sessionStorage.setItem("obs_comment",            $("#InputOBScomment").val().trim());
    window.sessionStorage.setItem("obs_id_tree_species",    $("#InputSelectSpecies").children("option:selected").val());
    window.sessionStorage.setItem("obs_id_crown_diameter",  $("#InputSelectCrown").children("option:selected").val());
    window.sessionStorage.setItem("obs_id_canopy_status",   $("#InputSelectStatus").children("option:selected").val());
    window.sessionStorage.setItem("obs_latitude",           $("#Inputlatitude").val().trim());
    window.sessionStorage.setItem("obs_longitude",          $("#Inputlongitude").val().trim());
    window.sessionStorage.setItem("photo_compass",          $("#Inputcompass").val().trim());
}

function getWSitems() {
    var obs = {id:'', id_aoi:'', name:'', comment:'', id_tree_species:'', id_crown_diameter:'', id_canopy_status:'', latitude:'', longitude:'', photo:''};
    obs.name =              window.sessionStorage.getItem("obs_name");
    obs.comment =           window.sessionStorage.getItem("obs_comment");
    obs.id_tree_species =   window.sessionStorage.getItem("obs_id_tree_species");
    obs.id_crown_diameter = window.sessionStorage.getItem("obs_id_crown_diameter");
    obs.id_canopy_status =  window.sessionStorage.getItem("obs_id_canopy_status");
    obs.latitude =          window.sessionStorage.getItem("obs_latitude");
    obs.longitude =         window.sessionStorage.getItem("obs_longitude");
    obs.compass =           window.sessionStorage.getItem("photo_compass");
    obs.id_aoi =            window.sessionStorage.getItem("id_aoi");
    var id_obs = window.sessionStorage.getItem("obs_id");
    if ((id_obs !== null) && (id_obs != '')) {
        obs.id = id_obs;
    }
    if ((obs.compass === null) || (obs.compass == '')) {
        obs.compass = 0.0;
    }
    obs.photo = window.sessionStorage.getItem("photo_image");
    return obs;
}

function clearWSitems() {        
    window.sessionStorage.removeItem("obs_id");
    window.sessionStorage.removeItem("obs_name");
    window.sessionStorage.removeItem("obs_comment");
    window.sessionStorage.removeItem("obs_id_tree_species");
    window.sessionStorage.removeItem("obs_id_crown_diameter");
    window.sessionStorage.removeItem("obs_id_canopy_status");
    window.sessionStorage.removeItem("obs_latitude");
    window.sessionStorage.removeItem("obs_longitude");
    window.sessionStorage.removeItem("photo_id");
    window.sessionStorage.removeItem("photo_compass");
    window.sessionStorage.removeItem("photo_image");
}

function init_form() {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM treespecies;';
        tx.executeSql(query, [], function (tx, res) {
            var html = "";
            for(var x = 0; x < res.rows.length; x++) {
                $('#InputSelectSpecies').append($('<option>', {
                    value: res.rows.item(x).id,
                    text : res.rows.item(x).name
                }));
            }
        },
        function (tx, error) {
            console.log('SELECT treespecies error: ' + error.message);
        });
        // crowns
        var query = 'SELECT * FROM crowndiameter;';
        tx.executeSql(query, [], function (tx, res) {
            var html = "";
            for(var x = 0; x < res.rows.length; x++) {
                $('#InputSelectCrown').append($('<option>', {
                    value: res.rows.item(x).id,
                    text : res.rows.item(x).name
                }));
            }
        },
        function (tx, error) {
            console.log('SELECT crowndiameter error: ' + error.message);
        });
        // status
        var query = 'SELECT * FROM canopystatus;';
        tx.executeSql(query, [], function (tx, res) {
            var html = "";
            for(var x = 0; x < res.rows.length; x++) {
                $('#InputSelectStatus').append($('<option>', { 
                    value: res.rows.item(x).id,
                    text : res.rows.item(x).name 
                }));
            }
        },
        function (tx, error) {
            console.log('SELECT canopystatus error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction treespecies error: ' + error.message);
    }, function () {
        console.log('transaction treespecies ok');
        var obs = getWSitems();
        var id_obs = obs.id;
        $("#InputOBSname").val(obs.name);
        $("#InputOBScomment").val(obs.comment);
        $("#InputSelectSpecies").val(obs.id_tree_species);
        $("#InputSelectCrown").val(obs.id_crown_diameter);
        $("#InputSelectStatus").val(obs.id_canopy_status);
        $("#Inputlatitude").val(obs.latitude);
        $("#Inputlongitude").val(obs.longitude);
        $("#Inputcompass").val(obs.compass);
        var image = document.getElementById('image');
        image.src = "data:image/jpeg;base64," + obs.photo;
        window.plugins.spinnerDialog.hide();
    });
};