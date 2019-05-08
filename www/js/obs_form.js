var obsform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        window.plugins.spinnerDialog.show(); 
        init_form(); 
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

obsform.initialize();

$("#saveobs").click( function(e) {
    e.preventDefault();
    setWSitems();
    insert_OBS(getWSitems());
    return false;
});

$("#cancelobs").click( function(e) {
    e.preventDefault();
    clearWSitems();
    window.location = 'obs_list.html'
    return false;
});

function insert_OBS(obs) {
    db.transaction(function(tx) {
        // ?? in order to keep ids unchanged, replace it with: 
        // INSERT OR IGNORE INTO obs (id, name) VALUES (myid, myname)
        // UPDATE obs SET name = "name" WHERE id=id_obs
        var sqlstr = 
            "REPLACE INTO obs(id, name, id_aoi, id_tree_species, id_crown_diameter, "
            + "id_canopy_status, comment, longitude, latitude, compass) "
            + "VALUES(" + obs.id + ",'" + obs.name + "'," + obs.id_aoi + "," + obs.id_tree_species + "," + obs.id_crown_diameter + ","
            + obs.id_canopy_status + ",'" +obs.comment + "'," + obs.longitude + "," + obs.latitude + "," + obs.compass + ")";

        tx.executeSql(sqlstr);

    }, function(error) {
        console.log('Transaction OBS ERROR: ' + error.message);
        alert(error.message);
    }, function() {
        console.log('Populated table OBS OK');
        clearWSitems();
        window.location = 'obs_list.html';
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
    window.sessionStorage.setItem("obs_compass",            $("#Inputcompass").val().trim());
}

function getWSitems() {
    var obs = {id:'', id_aoi:'', name:'', comment:'', id_tree_species:'', id_crown_diameter:'', id_canopy_status:'', latitude:'', longitude:''};
    obs.name =              window.sessionStorage.getItem("obs_name");       
    obs.comment =           window.sessionStorage.getItem("obs_comment");
    obs.id_tree_species =   window.sessionStorage.getItem("obs_id_tree_species");
    obs.id_crown_diameter = window.sessionStorage.getItem("obs_id_crown_diameter");          
    obs.id_canopy_status =  window.sessionStorage.getItem("obs_id_canopy_status");          
    obs.latitude =          window.sessionStorage.getItem("obs_latitude");
    obs.longitude =         window.sessionStorage.getItem("obs_longitude");          
    obs.compass =           window.sessionStorage.getItem("obs_compass");
    obs.id_aoi =            window.sessionStorage.getItem("id_aoi");
    var id_obs = window.sessionStorage.getItem("obs_id");
    if ((id_obs === null) || (id_obs == '')) {
        obs.id = window.sessionStorage.setItem("obs_id","NULL");
    } else {
        obs.id = id_obs;
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
    window.sessionStorage.removeItem("obs_compass");
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
        window.plugins.spinnerDialog.hide();             
    }
    );
};


