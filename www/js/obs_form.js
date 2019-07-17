var obsform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        document.addEventListener("backbutton", onBackKeyDown, false);
        init_form();


        $('#photo').on('click', function() {
            //e.preventDefault();
            navigator.camera.getPicture(
                function(imageData) {                    
                    $('#preview_text').remove();
                    var format = "data:image/jpeg;base64,";
                    var src = format + imageData;                

                    window.sessionStorage.setItem("photo_image", src);
                    window.sessionStorage.setItem("photo_id", "");
                    window.sessionStorage.setItem("photo_comment", "");
                    window.sessionStorage.setItem("photo_compassbearing", "");
                    
                    window.location = "photo_form.html";
                },
                function() {
                    displayMessage("Picture canceled", function() {})                    
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
    //displayMessage("OBS creation/editing canceled.", function() {clearWSitems(); window.location = "obs_list.html";});
    clearWSitems(); 
    window.location = "obs_list.html";
}

$("#saveobs").click( function(e) {
    e.preventDefault();    
    if ($("#OBS-form")[0].checkValidity() === false) {
        $("#OBS-form")[0].classList.add('was-validated');
        return false;
    } else {
        $("#OBS-form")[0].classList.add('was-validated');
    }    
    setWSitems();
    insert_OBS(getWSitems());
    return false;
});

function insert_OBS(obs) {
    db.transaction(function(tx) {
        var sqlstr = 
            "REPLACE INTO surveydata(id, name, id_aoi, id_tree_species, id_crown_diameter, "
            + "id_canopy_status, comment, longitude, latitude, uploaded) "
            + "VALUES(" +   obs.id + ",'" + obs.name + "'," + obs.id_aoi + "," + obs.id_tree_species + "," + obs.id_crown_diameter + ","
            +               obs.id_canopy_status + ",'" + obs.comment + "'," + obs.longitude + "," + obs.latitude + ",0);";

        tx.executeSql(sqlstr, [], function(tx, results) {
                var obsid = results.insertId;
                // necessary if new observation because field photo.id_surveydata is NULL
                var sql = "UPDATE photo set id_surveydata = " + obsid + " where id_surveydata is NULL;"      
                tx.executeSql(sql, [],
                    function(tx, res) {
                        //window.sessionStorage.setItem("photo_id", res.insertId);
                        clearWSitems();
                        window.location = 'obs_list.html';
                    },
                    function(tx, error) {
                        console.log('ExecuteSQL Photo error: ' + error.message);
                    }
                );
            }, function(error) {
                console.log('ExecuteSQL surveydata ERROR: ' + error.message);
            }
        );
    }, function(error) {
        console.log('Transaction SURVEYDATA ERROR: ' + error.message);
        displayMessage("Error - It was not possible to store the observation.",()=>{});
    }, function() {

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
    //window.sessionStorage.setItem("photo_compass",          $("#Inputcompass").val().trim());
    //window.sessionStorage.setItem("photo_image",            document.getElementById('image').src);
}

function getWSitems() {
    var obs = {};
    obs.uploaded =          window.sessionStorage.getItem("obs_uploaded");
    obs.name =              window.sessionStorage.getItem("obs_name");
    obs.comment =           window.sessionStorage.getItem("obs_comment");
    obs.id_tree_species =   window.sessionStorage.getItem("obs_id_tree_species");
    obs.id_crown_diameter = window.sessionStorage.getItem("obs_id_crown_diameter");
    obs.id_canopy_status =  window.sessionStorage.getItem("obs_id_canopy_status");
    obs.latitude =          window.sessionStorage.getItem("obs_latitude");
    obs.longitude =         window.sessionStorage.getItem("obs_longitude");    
    obs.id_aoi =            window.sessionStorage.getItem("id_aoi");
    obs.id =                window.sessionStorage.getItem("obs_id");    

    if (!obs.id) {
        obs.id = "NULL";
    }
    if (!obs.id_tree_species || obs.id_tree_species==="undefined") {
        obs.id_tree_species = 5;
    }
    if (!obs.id_crown_diameter || obs.id_crown_diameter==="undefined") {
        obs.id_crown_diameter = 18;
    }
    
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
    window.sessionStorage.removeItem("obs_uploaded");
    //window.sessionStorage.removeItem("photo_compass");
    //window.sessionStorage.removeItem("photo_image");    
}

function init_form() {
    var obs = getWSitems();
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
        // photos
        var query = 'SELECT * FROM photo where id_surveydata' + (obs.id=="NULL" ? ' is NULL' : ' = ' + obs.id ) + ';';
        tx.executeSql(query, [], function (tx, res) {
            var html = "";
            for(var x = 0; x < res.rows.length; x++) {
                $('.carousel-indicators').append('<li data-target="#carouselphotos" data-slide-to="' + x + '" ' + ((x==0)?'class="active"':'') + '></li>');
                $('.carousel-inner').append(
                    '<div class="carousel-item ' + ((x==0)?'active':'') + '">' 
                    +   ' <img class="d-block w-100 h-100"' 
                        +   ' src="'            + res.rows.item(x).image    + '"'
                        +   ' data-comment="'   + res.rows.item(x).comment  + '"'
                        +   ' data-compass="'   + res.rows.item(x).compass  + '">'
                    +   ' <div class="carousel-caption">'
                    +       ((res.rows.item(x).compass)?' <h5>'   + Number(res.rows.item(x).compass).toFixed(1) + '&deg;</h5>':'')
                    +       ((res.rows.item(x).comment)?' <p>'    + res.rows.item(x).comment  + '</p>':'')
                    +   '</div>'
                    +'</div>');
            }
        },
        function (tx, error) {
            console.log('SELECT canopystatus error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
        $("#InputOBSname").val(obs.name);
        $("#InputOBScomment").val(obs.comment);
        $("#InputSelectSpecies").val(obs.id_tree_species);
        $("#InputSelectCrown").val(obs.id_crown_diameter);
        $("#InputSelectStatus").val(obs.id_canopy_status);
        $("#Inputlatitude").val(obs.latitude);
        $("#Inputlongitude").val(obs.longitude);        
        //$("#Inputcompass").val(obs.photo.compass);
/*         if (obs.photo.image) {
            $('#preview_text').remove();
            document.getElementById('image').src = obs.photo.image;
        } */
        if (obs.uploaded === "1") { $("#saveobs").hide(); }
        $('#carouselphotos').carousel('pause');
        //window.plugins.spinnerDialog.hide();
    });
};