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

$("#saveaoi").click( function(e) {
    e.preventDefault();
    var id_aoi = window.sessionStorage.getItem("id_aoi");
    var aoiname = $("#InputAOIname").text;
    var bbox = { xmin : $("#Inputxmin").text,
                 xmax : $("#Inputxmax").text,
                 ymin : $("#Inputymin").text,
                 ymax : $("#Inputymax").text }

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
    window.sessionStorage.setItem("aoiname",$("#InputAOIname").text);
    window.location = 'aoi_map.html';    
    return false; 
} );