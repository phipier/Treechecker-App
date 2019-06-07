var areaSelect;
var LayerDefinitions;

document.addEventListener('deviceready', loadMap, false);

function loadMap() {

    LayerDefinitions = JSON.parse(window.sessionStorage.getItem("wms_url"));
    
    var map = L.map('mapid')  //.setView([39.701, -7.69], 10);
    
    for(let baselayer of LayerDefinitions.BASE_WMS) { 
        L.tileLayer(        baselayer.url, {
            attribution:    baselayer.attribution,
            maxZoom:        baselayer.maxZoom
        }).addTo(map);
    }

    for(let WMSlayer of LayerDefinitions.DL_WMS) {        
        L.tileLayer.wms(    
            WMSlayer.url, {
            layers:         WMSlayer.layers,
            transparent:    WMSlayer.transparent,
            format:         WMSlayer.format,
            maxZoom:        WMSlayer.maxZoom
        }).addTo(map);
    }

    var ymin = window.sessionStorage.getItem("bbox_ymin");
    var ymax = window.sessionStorage.getItem("bbox_ymax");
    var xmin = window.sessionStorage.getItem("bbox_xmin");
    var xmax = window.sessionStorage.getItem("bbox_xmax");

    if ((ymin) && (ymax) && (xmin) && (xmax)) {
        var corner1 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymin")), Number(window.sessionStorage.getItem("bbox_xmin")));
        var corner2 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymax")), Number(window.sessionStorage.getItem("bbox_xmax")));
        var bounds = L.latLngBounds(corner1, corner2);
        map.fitBounds(bounds);
    } else {
        map.setView([39.701, -7.69], 10);
        // get bbox from response to GetCapabilities request ...
        //map.fitBounds(l_ortho.getBounds());
    }

    areaSelect = L.areaSelect({width:200, height:200});
    areaSelect.on("change", function() {
        var bounds = this.getBounds();        
    });
    areaSelect.addTo(map);
};

$("#savearea").click( function(e) {
    e.preventDefault();     
    var bounds = areaSelect.getBounds();
    console.log("selected bounds: " + bounds);      

    window.sessionStorage.setItem("bbox_xmin", bounds.getSouthWest().lng); 
    window.sessionStorage.setItem("bbox_xmax", bounds.getNorthEast().lng); 
    window.sessionStorage.setItem("bbox_ymin", bounds.getNorthEast().lat); 
    window.sessionStorage.setItem("bbox_ymax", bounds.getSouthWest().lat);        

    window.location = 'aoi_form.html';   
    return false; 
} );

function onBackKeyDown() {
    window.location = "aoi_form.html";
}

$("#cancelarea").click(function(e) {
    e.preventDefault();         
    window.location = 'aoi_form.html';   
    return false; 
} );
