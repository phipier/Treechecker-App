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
   

    var obsname = $("#InputOBSname").text;
    var latitude = $("#Inputlatitude").text;
    var longitude = $("#Inputlongitude").text;
                

    /*
  Params:	{ "name": "obsTest", "tree_specie": 2, "crown_diameter": 2, "canopy_status": 5, "comment": "This is a test from postman", 
  "latitude": 1.72789, "longitude": 45.123456, "compass": 30.45 }

  Response:	{ "key": 5, "name": "obsTest", "tree_specie": { "key": 2, "name": "specie2" }, 
  "crown_diameter": { "key": 2, "name": "0.2" }, "canopy_status": { "key": 5, "name": "status5" }, 
  "comment": "This is a test from Postman", "position": { "longitude": 45.123456, "latitude": 1.72789 }, "images": [ ] }
*/

    add_OBS(aoiname, bbox);

        //if (id_aoi == "") {sqlstr = "insert ..."}
        //else    {sqlstr = "update ... "}
        
    
    // download tiles
    downloadTiles(bbox)
    
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
sqlstr = "CREATE TABLE treespecie (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE crowndiameter (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE canopystatus (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
*/

/*
 <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" href="#">sp1</a>
                <a class="dropdown-item" href="#">sp2</a>
                <a class="dropdown-item" href="#">sp3</a>
                </div>
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

        // status


    }, function (error) {
        console.log('transaction treespecies error: ' + error.message);
    }, function () {
        console.log('transaction treespecies ok');                
    }
    );
};


function add_OBS(obs_data) {
    var id_region = window.sessionStorage.getItem("id_region");
   
    obs_data =  '{"name" :"'            + $("#InputOBSname").text; 
            + '", "tree_specie":"'      + $("#InputSelectSpecies").children("option:selected").val()
            + '", "crown_diameter":"'   + $("#InputSelectCrown").children("option:selected").val()
            + '", "canopy_status":"'    + $("#InputSelectStatus").children("option:selected").val()
            + '", "comment":"'          + $("#InputOBScomment").text
            + '", "latitude":"'         + Number($("#Inputlatitude").text) 
            + '", "longitude":"'        + Number($("#Inputlongitude").text) 
            + '", "compass":"'        + Number($("#Inputcompass").text) 
            + '", "y_max":"' + bbox.ymax + '"}';

    db.transaction(function(tx) {
        var sqlstr = 
            "REPLACE INTO obs(id, name, x_min, x_max, y_min, y_max, geographical_zone_id) "
            + "VALUES("+val.key+",'"+val.name+ "',"
            +           val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+ ","
            +           id_region+")";

        tx.executeSql(sqlstr);

    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Populated database OK');
            
        // download tiles
        downloadTiles(bbox, val.key)
        
    });
            
}


