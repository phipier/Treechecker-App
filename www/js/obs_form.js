var aoiform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var id_aoi = window.sessionStorage.getItem("id_aoi");
        var id_obs = window.sessionStorage.getItem("id_obs");
        var obs;

        init_dropdowns();
        
        if (id_obs !== null && id_obs != "") { 
            // editing an existing observation           
            //latitude = DBvalue;
            //longitude = DBvalue;      
        } else {
            obs = getWSitems();
        }       
        $("#InputOBSname").text(obs.name);
        $("#InputOBScomment").text(obs.comment);
        $("#InputSelectSpecies").val(obs.id_tree_species);
        $("#InputSelectSpecies").val(obs.id_crown_diameter);
        $("#InputSelectSpecies").val(obs.id_canopy_status);
        $("#Inputlatitude").text(obs.latitude);
        $("#Inputlongitude").text(obs.longitude);
        $("#Inputcompass").text(obs.compass);
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};

aoiform.initialize();

$("#saveobs").click( function(e) {
    e.preventDefault();
    var id_aoi = window.sessionStorage.getItem("id_aoi");

    $("select.country").change(function(){
        var selectedCountry = $(this).children("option:selected").val();
    });

    var id_aoi = window.sessionStorage.getItem("id_aoi");
    setWSitems();
    // if online then send also data to server?  insert_OBS as success callback    
    insert_OBS(getWSitems());

    return false; 
});

function insert_OBS(obs) {
    db.transaction(function(tx) {
        var sqlstr = 
            "INSERT INTO obs(name, id_aoi, id_tree_species, id_crown_diameter, "
            + "id_canopy_status, comment, longitude, latitude, compass, is_deleted) "
            + "VALUES(" + obs.name + "," + obs.id_aoi + "," + obs.id_tree_species + "," + obs.id_crown_diameter + ","
            + obs.id_canopy_status + "," +obs.comment + "," + obs.longitude + "," + obs.latitude + "," + obs.compass + ")";

        tx.executeSql(sqlstr);

    }, function(error) {
        console.log('Transaction OBS ERROR: ' + error.message);
    }, function() {
        console.log('Populated table OBS OK');            
        // download tiles         
        window.sessionStorage.setItem("id_obs","");
        window.location("obs_list.html")         
    });            
}

$("#selectposition").click( function(e) {
    e.preventDefault();     
    setWSitems();
    window.location = 'obs_map.html';    
    return false; 
} );

function setWSitems() {
    window.sessionStorage.setItem("obs_name",               $("#InputOBSname").text);
    window.sessionStorage.setItem("obs_comment",            $("#InputOBScomment").text);
    window.sessionStorage.setItem("obs_id_tree_species",    $("#InputSelectSpecies").children("option:selected").val());
    window.sessionStorage.setItem("obs_id_crown_diameter",  $("#InputSelectCrown").children("option:selected").val());
    window.sessionStorage.setItem("obs_id_canopy_status",   $("#InputSelectStatus").children("option:selected").val());
    window.sessionStorage.setItem("obs_latitude",           $("#Inputlatitude").text);
    window.sessionStorage.setItem("obs_longitude",          $("#Inputlongitude").text);
    window.sessionStorage.setItem("obs_compass",            $("#Inputcompass").text);
}

function getWSitems() {
    var obs = {id_aoi:'', name:'', comment:'', id_tree_species:'', id_crown_diameter:'', id_canopy_status:'', latitude:'', longitude:''};
    obs.name =              window.sessionStorage.getItem("obs_name");       
    obs.comment =           window.sessionStorage.getItem("obs_comment");
    obs.id_tree_species =   window.sessionStorage.getItem("obs_id_tree_species");
    obs.id_crown_diameter = window.sessionStorage.getItem("obs_id_crown_diameter");          
    obs.id_canopy_status =  window.sessionStorage.getItem("obs_id_canopy_status");          
    obs.latitude =          window.sessionStorage.getItem("obs_latitude");
    obs.longitude =         window.sessionStorage.getItem("obs_longitude");          
    obs.compass =           window.sessionStorage.getItem("obs_compass");
    obs.id_aoi =            window.sessionStorage.getItem("id_aoi");
    return obs;
}

function init_dropdowns() {

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
    }
    );
};


