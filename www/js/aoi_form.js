var aoiform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var id_aoi = window.sessionStorage.getItem("id_aoi");
                 
        $("#InputAOIname").val(window.sessionStorage.getItem("aoiname"));
        $("#Inputxmin").val(window.sessionStorage.getItem("bbox_xmin")); 
        $("#Inputxmax").val(window.sessionStorage.getItem("bbox_xmax"));
        $("#Inputymin").val(window.sessionStorage.getItem("bbox_ymin")); 
        $("#Inputymax").val(window.sessionStorage.getItem("bbox_ymax"));
            
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
    
    // check bbox value (not too large)

    add_AOI(aoiname, bbox);
    return false; 
} );

$("#selectarea").click( function(e) {
    e.preventDefault();     
    window.sessionStorage.setItem("aoiname",$("#InputAOIname").val());
    window.location = 'aoi_map.html'; 
    return false;
});

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
            $("#saveaoi").prepend('<span id="loadingspinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
            
            downloadTiles(val.key, bbox);
        },
        error : function(req, status, error) {
            if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
                $("#errorpopupdata>p").html("");
            }
            $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - It was not possible to add the AOI to the remote DB.</p>");
            $('#errorpopup').modal('show');

            console.log("error in request: "+req.responseText);
        }
    });
}

function exit_form(success) {
    $("#saveaoi").remove("#loadingspinner");
    if (success) {        
        if(document.getElementById("successpopupdata").getElementsByTagName('p').length > 0) {
            $("#successpopupdata>p").html("");
        }
        $("#successpopupdata").prepend("<p><i class='fas fa-smile'></i> AOI created.</p>");
        $('#successpopup').modal('show');
        $("#ok_sent_success").click(function(){
            $("#successpopup").modal("hide");
            window.location = 'aoi_list.html';
        });        
    }
}

function insert_AOI(val, id_region) {
    db.transaction(function(tx) {
        var sqlstr = 
            "REPLACE INTO aoi(id, name, x_min, x_max, y_min, y_max, geographical_zone_id) "
            + "VALUES("+val.key+",'"+val.name+ "',"
            +           val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+ ","
            +           id_region+")";

        tx.executeSql(sqlstr);

    }, function(error) {
        if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
            $("#errorpopupdata>p").html("");
        }
        $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - It was not possible to add the AOI to the local DB.</p>");
        $('#errorpopup').modal('show');
    }, function() {
        console.log('Populated database OK');
    });
}