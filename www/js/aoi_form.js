var aoiform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var id_aoi = window.sessionStorage.getItem("id_aoi");
        if (id_aoi != "") { 
            // editing an existing AOI
            // ?? window.sessionStorage.getItem("fromAOIMap") == "false";
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
        }
        
        //window.sessionStorage.setItem("fromAOIMap", "false");
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

    // check bbox value (not too large) ?

    // insert into table AOI (local DB)
    // replace ?

        //if (id_aoi == "") {sqlstr = "insert ..."}
        //else    {sqlstr = "update ... "}
            
    // download tiles
    downloadTiles(bbox)
    
    return false; 
} );

$("#selectarea").click( function(e) {
    e.preventDefault();     
    window.sessionStorage.setItem("aoiname",$("#InputAOIname").val());
    window.location = 'aoi_map.html';   
    return false; 
} );