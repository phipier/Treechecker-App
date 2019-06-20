var areaSelect;
var LayerDefinitions;
var overlays;
var baseMaps;
var mymap;
var controlLayers;

document.addEventListener('deviceready', loadmap, false);

function loadmap() {

    LayerDefinitions = JSON.parse(window.sessionStorage.getItem("wms_url"));    

    mymap = L.map('mapid');

    overlays = {};
    baseMaps = {};

    for(let baselayer of LayerDefinitions.BASE_WMS) { 

        var ll_baselayer = L.tileLayer(         baselayer.url, {
                                attribution:    baselayer.attribution,
                                maxZoom:        Number(baselayer.maxZoom)            
        });
        ll_baselayer.addTo(mymap);   

        if(controlLayers)
            controlLayers.addBaseLayer(ll_baselayer, baselayer.layerName);
        else
            baseMaps[baselayer.name] = ll_baselayer;
    }

    for(let WMSlayer of LayerDefinitions.DL_WMS) {    

        var ll_layer = L.tileLayer.wms(    
            WMSlayer.url, {
                layers:         WMSlayer.layers,
                transparent:    WMSlayer.transparent,
                format:         WMSlayer.format,
                maxZoom:        Number(WMSlayer.maxZoom)//,
                //maxNativeZoom:  WMSlayer.maxNativeZoom
        });
        ll_layer.addTo(mymap);

        if(controlLayers)
            controlLayers.addOverlay(ll_layer, WMSlayer.name);
        else
            overlays[WMSlayer.name] = ll_layer;
    }

    addMapControls();
    
    var aoi_ymin = window.sessionStorage.getItem("bbox_ymin");var aoi_ymax = window.sessionStorage.getItem("bbox_ymax");
    var aoi_xmin = window.sessionStorage.getItem("bbox_xmin");var aoi_xmax = window.sessionStorage.getItem("bbox_xmax");
    
    var reg_ymin = window.sessionStorage.getItem("reg_ymin");var reg_ymax = window.sessionStorage.getItem("reg_ymax");
    var reg_xmin = window.sessionStorage.getItem("reg_xmin");var reg_xmax = window.sessionStorage.getItem("reg_xmax");
    
    if ((aoi_ymin) && (aoi_ymax) && (aoi_xmin) && (aoi_xmax)) {
        var corner1 = L.latLng(Number(aoi_ymin), Number(aoi_xmin));
        var corner2 = L.latLng(Number(aoi_ymax), Number(aoi_xmax));      

    } else if ((reg_ymin) && (reg_ymax) && (reg_xmin) && (reg_xmax)) {
        var corner1 = L.latLng(Number(reg_ymin), Number(reg_xmin));
        var corner2 = L.latLng(Number(reg_ymax), Number(reg_xmax));
        // get bbox from response to GetCapabilities request ...
        //mymap.fitBounds(l_ortho.getBounds());
    } else {
        var corner1 = L.latLng(43, 3);
        var corner2 = L.latLng(46, 6);
        //mymap.setView([45, 5], 5);        
    }

    var bounds = L.latLngBounds(corner1, corner2);
        mymap.fitBounds(bounds);

    areaSelect = L.areaSelect({width:200, height:200});
    areaSelect.on("change", function() {
        var bounds = this.getBounds();        
    });
    areaSelect.addTo(mymap);    

};

$("#savearea").click( function(e) {
    e.preventDefault();     
    var bounds = areaSelect.getBounds();
    console.log("selected bounds: " + bounds); 
    
    if (Math.abs(bounds.getSouthWest().lng-bounds.getNorthEast().lng < 0.005) && 
        Math.abs(bounds.getNorthEast().lat-bounds.getSouthWest().lat < 0.005)) {

        window.sessionStorage.setItem("bbox_xmin", bounds.getSouthWest().lng); 
        window.sessionStorage.setItem("bbox_xmax", bounds.getNorthEast().lng); 
        window.sessionStorage.setItem("bbox_ymin", bounds.getNorthEast().lat); 
        window.sessionStorage.setItem("bbox_ymax", bounds.getSouthWest().lat);

        window.location = 'aoi_form.html';

    } else {

        displayMessage("The area selected is too large, please select a smaller area.", ()=>{});

    }
    return false; 
} );

function onBackKeyDown() {
    window.location = "aoi_form.html";
}

function addMapControls() {
    controlLayers = new L.control.layers(baseMaps, overlays, {sortLayers: true, hideSingleBase: false});
    controlLayers.addTo(mymap);

    L.control.scale().addTo(mymap);
}

/* $("#cancelarea").click(function(e) {
    e.preventDefault();         
    window.location = 'aoi_form.html';   
    return false; 
} ); */
