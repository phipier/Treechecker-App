var areaSelect;
var LayerDefinitions;
var overlays;
var baseMaps;
var map;
var controlLayers;

document.addEventListener('deviceready', loadmap, false);

function loadmap() {

    LayerDefinitions = JSON.parse(window.sessionStorage.getItem("wms_url")); 
 
    map = L.map('mapid');

    overlays = {};
    baseMaps = {};

    for(let baselayer of LayerDefinitions.BASE_WMS) { 

        var ll_baselayer = L.tileLayer(         baselayer.url, {
                                attribution:    baselayer.attribution,
                                maxZoom:        Number(baselayer.maxZoom)            
        });
        ll_baselayer.addTo(map);   

        if(controlLayers)
            controlLayers.addBaseLayer(ll_baselayer, baselayer.layerName);
        else
            baseMaps[baselayer.name] = ll_baselayer;
    }

    if (window.sessionStorage.getItem("features")) {
        Features         = JSON.parse(window.sessionStorage.getItem("features"));  

        var FeaturesStyle = {
            "color": "#ff7800",
            "weight": 5,
            "opacity": 0.65
        };
        
        var ll_features = L.geoJSON(Features, {
            style: FeaturesStyle
        })

        ll_features.addTo(map);

        if(controlLayers)
            controlLayers.addOverlay(ll_features, "Features");
        else
            overlays["Features"] = ll_features;
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
        ll_layer.addTo(map);

        if(controlLayers)
            controlLayers.addOverlay(ll_layer, WMSlayer.name);
        else
            overlays[WMSlayer.name] = ll_layer;
    }

     

    addMapControls();
    
    var aoi_ymin = Number(window.sessionStorage.getItem("bbox_ymin"));var aoi_ymax = Number(window.sessionStorage.getItem("bbox_ymax"));
    var aoi_xmin = Number(window.sessionStorage.getItem("bbox_xmin"));var aoi_xmax = Number(window.sessionStorage.getItem("bbox_xmax"));
    
    var reg_ymin = Number(window.sessionStorage.getItem("reg_ymin"));var reg_ymax = Number(window.sessionStorage.getItem("reg_ymax"));
    var reg_xmin = Number(window.sessionStorage.getItem("reg_xmin"));var reg_xmax = Number(window.sessionStorage.getItem("reg_xmax"));
    
    if ((aoi_ymin) && (aoi_ymax) && (aoi_xmin) && (aoi_xmax)) {
        var corner1 = L.latLng(Number(aoi_ymin), Number(aoi_xmin));
        var corner2 = L.latLng(Number(aoi_ymax), Number(aoi_xmax));      

    } else if ((reg_ymin) && (reg_ymax) && (reg_xmin) && (reg_xmax)) {
        var corner1 = L.latLng(Number(reg_ymin), Number(reg_xmin));
        var corner2 = L.latLng(Number(reg_ymax), Number(reg_xmax));
        // get bbox from response to GetCapabilities request ...
        //map.fitBounds(l_ortho.getBounds());
    } else {
        var corner1 = L.latLng(43, 3);
        var corner2 = L.latLng(46, 6);
        //map.setView([45, 5], 5);        
    }

    var bounds = L.latLngBounds(corner1, corner2);
        map.fitBounds(bounds);

    areaSelect = L.areaSelect({width:300, height:300});
    areaSelect.on("change", function() {
        var bounds = this.getBounds();        
    });
    areaSelect.addTo(map);    

};

$("#savearea").click( function(e) {
    e.preventDefault();     
    var bounds = areaSelect.getBounds();
    console.log("selected bounds: " + bounds); 
    
    if ((Math.abs(bounds.getSouthWest().lng-bounds.getNorthEast().lng) < 0.02) && 
        (Math.abs(bounds.getNorthEast().lat-bounds.getSouthWest().lat) < 0.02)) {

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
    controlLayers.addTo(map);

    L.control.scale().addTo(map);
}

/* $("#cancelarea").click(function(e) {
    e.preventDefault();         
    window.location = 'aoi_form.html';   
    return false; 
} ); */
