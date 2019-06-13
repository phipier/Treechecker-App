var areaSelect;
var LayerDefinitions;
var overlays;
var mymap;

document.addEventListener('deviceready', loadmap, false);

function loadmap() {

    LayerDefinitions = JSON.parse(window.sessionStorage.getItem("wms_url"));
    
    var mymap = L.map('mapid');
    addmapControls();
    
    for(let baselayer of LayerDefinitions.BASE_WMS) { 
        var l_baselayer = L.tileLayer(          baselayer.url, {
                                attribution:    baselayer.attribution,
                                maxZoom:        baselayer.maxZoom            
        });
        l_baselayer.addTo(mymap);
        controlLayers.addBaseLayer(osm, LayerDefinitions.osm.layerName);
    }

    for(let WMSlayer of LayerDefinitions.DL_WMS) {        
        var ll_layer = L.tileLayer.wms(    
            WMSlayer.url, {
            layers:         WMSlayer.layers,
            transparent:    WMSlayer.transparent,
            format:         WMSlayer.format,
            maxZoom:        WMSlayer.maxZoom,
            maxNativeZoom:  WMSlayer.maxNativeZoom
        });
        ll_layer.addTo(mymap);
        if(controlLayers)
            controlLayers.addOverlay(ll_layer, WMSlayer.name);
        else
            overlays[layer.name] = ll_layer;
    }
    }

    var ymin = window.sessionStorage.getItem("bbox_ymin");
    var ymax = window.sessionStorage.getItem("bbox_ymax");
    var xmin = window.sessionStorage.getItem("bbox_xmin");
    var xmax = window.sessionStorage.getItem("bbox_xmax");

    if ((ymin) && (ymax) && (xmin) && (xmax)) {
        var corner1 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymin")), Number(window.sessionStorage.getItem("bbox_xmin")));
        var corner2 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymax")), Number(window.sessionStorage.getItem("bbox_xmax")));
        var bounds = L.latLngBounds(corner1, corner2);
        mymap.fitBounds(bounds);
    } else {
        mymap.setView([39.701, -7.69], 10);
        // get bbox from response to GetCapabilities request ...
        //mymap.fitBounds(l_ortho.getBounds());
    }

    areaSelect = L.areaSelect({width:200, height:200});
    areaSelect.on("change", function() {
        var bounds = this.getBounds();        
    });
    areaSelect.addTo(mymap);
    L.control.scale().addTo(mymap);
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

function addmapControls() {
    controlLayers = new L.control.layers({}, overlays, {sortLayers: true, hideSingleBase: true});
    controlLayers.addTo(mymap);
    mymap.addControl(new customControl());
    L.control.scale().addTo(mymap);
}

/* $("#cancelarea").click(function(e) {
    e.preventDefault();         
    window.location = 'aoi_form.html';   
    return false; 
} ); */
