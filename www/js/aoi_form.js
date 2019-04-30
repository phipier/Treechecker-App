var aoiform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {

        window.plugins.spinnerDialog.show();
        var id_aoi = window.sessionStorage.getItem("id_aoi");
        if (id_aoi !== null && id_aoi != "") { 
            // select from local DB ...
            // editing an existing AOI            
            //bbox_xmin = DBvalue; 
            //bbox_xmax = DBvalue; 
            //bbox_ymin = DBvalue;
            //bbox_ymax = DBvalue;
        } else {                   
            $("#InputAOIname").val(window.sessionStorage.getItem("aoiname"));
            $("#Inputxmin").val(window.sessionStorage.getItem("bbox_xmin")); 
            $("#Inputxmax").val(window.sessionStorage.getItem("bbox_xmax"));
            $("#Inputymin").val(window.sessionStorage.getItem("bbox_ymin")); 
            $("#Inputymax").val(window.sessionStorage.getItem("bbox_ymax"));
            $("#InputforceRedld").val(window.sessionStorage.getItem("forceRedld"));
        }
        window.plugins.spinnerDialog.hide();        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

aoiform.initialize();

$("#saveaoi").click( function(e) {
    e.preventDefault();

    var id_aoi = window.sessionStorage.getItem("id_aoi");

    var aoiname = $("#InputAOIname").val();
    var bbox = { xmin : Number($("#Inputxmin").val()),
                 xmax : Number($("#Inputxmax").val()),
                 ymin : Number($("#Inputymin").val()),
                 ymax : Number($("#Inputymax").val()) }
    //var forceRedld = $("#InputforceRedld").val();
    
    // check bbox value (not too large)

    // insert AOI into server DB 
    add_AOI(aoiname, bbox);    

    return false; 

} );

$("#selectarea").click( function(e) {
    e.preventDefault();     
    window.sessionStorage.setItem("aoiname",$("#InputAOIname").val());
    window.location = 'aoi_map.html';   
    return false; 
} );

function add_AOI(aoiname, bbox) {
    var token = window.sessionStorage.getItem("token");
    var id_region = window.sessionStorage.getItem("id_region");

    aoi_data =  '{"name" :"' + aoiname 
            + '", "x_min":"' + bbox.xmin 
            + '", "x_max":"' + bbox.xmax 
            + '", "y_min":"' + bbox.ymin 
            + '", "y_max":"' + bbox.ymax + '"}';

    var urlaoi = SERVERURL + "/api/gzs/"+ id_region +"/aois/";

    $.ajax({
        async: true,
        crossDomain: true,
        url: urlaoi,
        method: "POST",
        headers: {
          "Authorization": "JWT " + token,
          "Content-Type": "application/json",
          "cache-control": "no-cache"         
        },
        processData: false,
        data: aoi_data,
        success : function(val) {              
            insert_AOI(val, id_region); 
            // download tiles
            downloadTiles(val.key, bbox);   
        },
        error : function(req, status, error) {
            console.log("error in request: "+req.responseText);
        }
    });
}

function insert_AOI(val, id_region) {
    db.transaction(function(tx) {
        var sqlstr = 
            "INSERT INTO aoi(id, name, x_min, x_max, y_min, y_max, geographical_zone_id) "
            + "VALUES("+val.key+",'"+val.name+ "',"
            +           val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+ ","
            +           id_region+")";

        tx.executeSql(sqlstr);

    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Populated database OK'); 
    });
}


