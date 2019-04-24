var aoiform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var id_aoi = window.sessionStorage.getItem("id_aoi");
        var id_obs = window.sessionStorage.getItem("id_obs");

        init_dropdowns();
        
        if (id_obs != "") { 
            // editing an existing observation           
            //bbox_xmin = DBvalue; 
            //bbox_xmax = DBvalue; 
            //bbox_ymin = DBvalue; 
            //bbox_ymax = DBvalue;
        } else {                   
            bbox_xmin = window.sessionStorage.getItem("bbox_xmin"); 
            bbox_xmax = window.sessionStorage.getItem("bbox_xmax"); 
            bbox_ymin = window.sessionStorage.getItem("bbox_ymin"); 
            bbox_ymax = window.sessionStorage.getItem("bbox_ymax");
        }
        $("#InputAOIname").text(window.sessionStorage.getItem("aoiname"));
        $("#Inputxmin").text(bbox_xmin); 
        $("#Inputxmax").text(bbox_xmax); 
        $("#Inputymin").text(bbox_ymin);
        $("#Inputymax").text(bbox_ymax);

        //window.sessionStorage.setItem("fromAOIMap", "false");
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

    var obsname   = $("#InputOBSname").text;
    var latitude  = Number($("#Inputlatitude").text);
    var longitude = Number($("#Inputlongitude").text);

    var id_aoi = window.sessionStorage.getItem("id_aoi");

    var obs_data =  '{"name" :"'    + $("#InputOBSname").text
    + '", "id_aoi":"'               + id_aoi
    + '", "id_tree_species":"'      + $("#InputSelectSpecies").children("option:selected").val()
    + '", "id_crown_diameter":"'    + $("#InputSelectCrown").children("option:selected").val()
    + '", "id_canopy_status":"'     + $("#InputSelectStatus").children("option:selected").val()
    + '", "comment":"'              + $("#InputOBScomment").text
    + '", "latitude":"'             + Number($("#Inputlatitude").text) 
    + '", "longitude":"'            + Number($("#Inputlongitude").text) 
    + '", "compass":"'              + Number($("#Inputcompass").text) 
    + '", "y_max":"'                + bbox.ymax + '"}';

    var obs = JSON.parse(obs_data);

    // if online then send also data to server?  add_OBS as success callback
    
    insert_OBS(obs);
    
    return false; 
});

$("#selectposition").click( function(e) {
    e.preventDefault();     
    window.sessionStorage.setItem("aoiname",$("#InputAOIname").text);
    window.location = 'obs_map.html';    
    return false; 
} );

function init_dropdowns() {

        /*
        sqlstr = "CREATE TABLE treespecies (id integer primary key, name varchar(100) not null);"
            runSQL(sqlstr);
            sqlstr = "CREATE TABLE crowndiameter (id integer primary key, name varchar(100) not null);"
            runSQL(sqlstr);
            sqlstr = "CREATE TABLE canopystatus (id integer primary key, name varchar(100) not null);"
            runSQL(sqlstr);
        */

    db.transaction(function (tx) {
        var query = 'SELECT * FROM treespecies;';
        tx.executeSql(query, [], function (tx, res) {
            var html = "";
            for(var x = 0; x < res.rows.length; x++) {
                $('#inputSelectSpecies').append($('<option>', { 
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
                $('#inputSelectCrown').append($('<option>', { 
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
                $('#inputSelectStatus').append($('<option>', { 
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


