document.addEventListener('deviceready', loadMap, false);


var mymap;
var gjson_layer;
var overlays;
var controlLayers;
var obslist;
var watchID = 0;

/* var customControl =  L.Control.extend({
    options: {
      position: 'topleft'
    },      
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');  
      L.DomEvent.disableClickPropagation(container);
      container.title = "Center map on current GPS position";
      container.style.backgroundColor = 'white';     
      container.style.backgroundImage = "url(file:///android_asset/www/lib/images/gps.png)";
      container.style.backgroundSize = "35px 35px";
      container.style.width = '40px';
      container.style.height = '40px';
      container.onclick = function(){
        centerMapOnCurrentPosition();
      }  
      return container;
    }
}); */

function loadMap() {
    document.addEventListener("backbutton", onBackKeyDown, false);
    $("#GPS").hide();$("#noGPS").show();

    obslist                 =               window.sessionStorage.getItem("obslist") === "True"?true:false;
    if (obslist) {$("#savelocation").hide();}

    var LayerDefinitions    = JSON.parse(   window.sessionStorage.getItem("wms_url"));
    var id_AOI              =               window.sessionStorage.getItem("id_aoi");
    var obs_latitude        =               window.sessionStorage.getItem("obs_latitude");
    var obs_longitude       =               window.sessionStorage.getItem("obs_longitude");
    var obs_id              =               window.sessionStorage.getItem("obs_id"); 
    if (!obs_id) {obs_id = "NULL";}

    mymap = L.map('mapid');

    mymap.on('error', e => {
        // Hide those annoying non-error errors
        if (e && e.error !== 'Error: Not Found')
            console.error(e);
    });

    controlLayers = {};
    overlays = {};

    addMapControls();

    bbox = window.sessionStorage.getItem("bbox");
    var corner1 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymin")), Number(window.sessionStorage.getItem("bbox_xmin")));
    var corner2 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymax")), Number(window.sessionStorage.getItem("bbox_xmax")));
    var bounds = L.latLngBounds(corner1, corner2);
    mymap.fitBounds(bounds);
    L.rectangle(bounds, {color: 'blue', fillOpacity: 0}).addTo(mymap);
    
    //initLayers();
    addOnlineWMSLayers(LayerDefinitions);
    addOfflineWMSLayers(id_AOI, LayerDefinitions);
    
    addMyObservations(id_AOI, obs_id);

    if (!obslist) {
        mymap.on('click', (e) => {
            createMarker(e.latlng);
        });

        // if position coordinates exist then create marker on map 
        if ((obs_latitude) & (obs_longitude)) {
            createMarker(L.latLng(obs_latitude, obs_longitude));
        }
    }
}



function onBackKeyDown() {
    if (obslist) {window.location = "obs_list.html";window.sessionStorage.removeItem("obslist");} 
    else {window.location = "obs_list.html";}
}

function switchGPS() {
    if (!watchID) {
        window.plugins.spinnerDialog.show(null, "Searching your position...");
        var onSuccess = function(position) {            
            $("#accuracyval").text("Accuracy: " + Number(position.coords.accuracy).toFixed(1).toString() + " m");
            
            mymap.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));

            createMarker(new L.LatLng(position.coords.latitude, position.coords.longitude));          
            createPulseMarker(new L.LatLng(position.coords.latitude, position.coords.longitude),Number(position.coords.accuracy));

            $("#GPS").show();$("#noGPS").hide();$("#accuracyval").show();
            window.plugins.spinnerDialog.hide();
        };
        function onError(error) {
            displayMessage('Could not get your position. Please make sure that GPS is on',()=>{});
            $("#GPS").hide();$("#noGPS").show();$("#accuracyval").hide();
            window.plugins.spinnerDialog.hide();
        }
        //navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout: 15000, enableHighAccuracy: true});
        watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000, enableHighAccuracy: true });
    } else {
        navigator.geolocation.clearWatch(watchID); 
        mymap.removeLayer(pulsemarker); pulsemarker = null;
        watchID = "";
        $("#GPS").hide();$("#noGPS").show();$("#accuracyval").hide();      
    }
}

var marker;
function createMarker(latlng_pos) {
    if (marker == null) { 
        marker = new L.marker(latlng_pos, {draggable:'true'});
        var icon = marker.options.icon;
        icon.options.iconSize   = [40, 60];
        icon.options.iconAnchor = [20, 60];
        marker.setIcon(icon);
        marker.setOpacity(0.8);
        marker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            marker.setLatLng(position ,{draggable:'true'});
            mymap.panTo(position);
        });
        mymap.addLayer(marker);
    }
    else { 
        marker.setLatLng(latlng_pos, {draggable:'true'});
    }
}

var pulsemarker;
function createPulseMarker(latlng_pos, accuracy) {
    var metresPerPixel = 40075016.686 * Math.abs(Math.cos(mymap.getCenter().lat * 180/Math.PI)) / Math.pow(2, mymap.getZoom()+8);
    var pixels_accuracy = Math.round(0.6*accuracy/metresPerPixel);
    var pulsingIcon = L.icon.pulse({iconSize:[pixels_accuracy,pixels_accuracy], color:'blue', fillColor:'#ffffff00', heartbeat:'3'});
    
    if (pulsemarker == null) {         
        pulsemarker = L.marker(latlng_pos,{icon: pulsingIcon, opacity:0.8}).addTo(mymap)
    }
    else { 
        pulsemarker.setLatLng(latlng_pos);
        pulsemarker.setIcon(pulsingIcon);
    }
}

/* 
function initLayers() {
    var osm = new L.TileLayer(LayerDefinitions.osm.url, {maxZoom: 22, maxNativeZoom: 19, attribution: LayerDefinitions.osm.attribution});
    mymap.addLayer(osm);
    controlLayers.addBaseLayer(osm, LayerDefinitions.osm.layerName);
} */

function addOfflineWMSLayers(id_AOI, LayerDefinitions) {     
    for(let layer of LayerDefinitions.DL_WMS) {         
        console.log("Adding " + layer.name);
        var ll_layer = new L.TileLayer(cordova.file.dataDirectory + "files/tiles/" + id_AOI + "/" + layer.layers + "/{z}/{x}/{y}.png", {maxZoom: Number(layer.maxZoom), maxNativeZoom: Number(layer.maxNativeZoom)});      

        mymap.addLayer(ll_layer);
        if(controlLayers)
            controlLayers.addOverlay(ll_layer, "Offline_"+layer.name);
        else
            overlays[layer.name] = "Offline_"+ll_layer;
    }
}

function addOnlineWMSLayers(LayerDefinitions) {     
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
            controlLayers.addOverlay(ll_layer, "Online_"+WMSlayer.name);
        else
            overlays["Online_"+WMSlayer.name] = ll_layer;
    }
}

function buildSurveyDataPopup(data) {
    var container = L.DomUtil.create('div');
    container.innerHTML = `<b>${data.name}</b><br><b>Status:&nbsp</b>${data.status}`;
    //var btn = L.DomUtil.create('i', 'fa fa-info-circle fa-2x centered', container);
    //L.DomEvent.on(btn, 'click', () => {
    //    viewElement(data.id)
    //});
    return container;  
}

function addMyObservations(id_aoi, id_obs) {

    const geojson = {  
        "type": "FeatureCollection",
        "features": []  
    };

    db.transaction(function (tx) {

        var query = 'SELECT s.*, cs.name as status '
                    +   'FROM surveydata AS s '                  
                    +   'INNER JOIN canopystatus    AS cs   on cs.id = s.id_canopy_status '
                    +   'where s.id_aoi = ' + id_aoi;                    
        if (id_obs != "NULL") { query += ' AND s.id != ' + id_obs; }
        query += ';'

        tx.executeSql(query, [], function (tx, res) {
            var WFS_json = '{"type": "FeatureCollection","features": [';
            for(var x = 0; x < res.rows.length; x++) {
                const item = res.rows.item(x);
                const geojsonPoint = {    
                    "type": "Feature",
                    "geometry": {
                    "type": "Point",
                    "coordinates": [item.longitude, item.latitude]
                    },
                    "properties": {
                        "popup":    buildSurveyDataPopup({/*"id":item.id,*/"name":item.name,"status":item.status}),
                        "id":       item.id,
                        "name":     item.name
                    }    
                };  
                geojson.features.push(geojsonPoint);
            }   
  
            
            if(gjson_layer != null) {
                controlLayers.removeLayer(gjson_layer);
                mymap.removeLayer(gjson_layer);
            }

            /* var gjsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }; */

            var redIcon = L.icon({
                iconUrl: 'file:///android_asset/www/lib/images/marker-red-small.png',                           
                iconSize:     [40, 40], // size of the icon          
                iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location  
                popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
            });

            gjson_layer = L.geoJSON(geojson, {
                    pointToLayer: function (feature, latlng) {
                        //return L.circleMarker(latlng, gjsonMarkerOptions);
                        return L.marker(latlng, {icon: redIcon});
                        //return L.marker(latlng);
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup(feature.properties.popup);
                    }
                }
            );

            /* Change icon size depending on Zoom level
            
            var ar_icon_1 = ...;
            var ar_icon_2 = ...;
            var ar_icon_1_double_size = ...;
            var ar_icon_2_double_size = ...;


            map.on('zoomend', function() {
                var currentZoom = map.getZoom();
                if (currentZoom > 12) {
                    all_testptLayer.eachLayer(function(layer) {
                        if (layer.feature.properties.num < 0.5)
                            return layer.setIcon(ar_icon_1);
                        else if (feature.properties.num < 1.0)
                            return layer.setIcon(ar_icon_2);
                    });
                } else {
                    all_testptLayer.eachLayer(function(layer) {
                        if (layer.feature.properties.num < 0.5)
                            return layer.setIcon(ar_icon_1_double_size);
                        else if (feature.properties.num < 1.0)
                            return layer.setIcon(ar_icon_2_double_size);
                    });
                }
            } */
        
            mymap.addLayer(gjson_layer);

            wfs_label = "my observations";
            if(controlLayers)
                controlLayers.addOverlay(gjson_layer, wfs_label);
            else
                overlays[wfs_label] = gjson_layer;   

        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });    
}

function addMapControls() {
    controlLayers = new L.control.layers({}, overlays, {sortLayers: false, hideSingleBase: false});
    controlLayers.addTo(mymap);
    //if (!obslist) {mymap.addControl(new customControl());}
    L.control.scale().addTo(mymap);
    //$("#accuracy").hide();
    $("#accuracyval").hide();
    var comp = new L.Control.Compass({autoActive: true, showDigit:true});
	mymap.addControl(comp);
}
  
$("#savelocation").click(function(e) {
    e.preventDefault();   
    if (marker) {
        window.sessionStorage.setItem("obs_latitude", marker.getLatLng().lat); 
        window.sessionStorage.setItem("obs_longitude", marker.getLatLng().lng);
        console.log("selected location: lat " + marker.getLatLng().lat + " lng " + marker.getLatLng().lng);
        window.location = 'obs_form.html';   
        return false;
    } else {
        displayMessage("Please click on the map (or GPS icon) to select a location.",()=>{});
    }
} );

$("#GPS").click(function(e) {
    e.preventDefault();   
    switchGPS();
} );

$("#noGPS").click(function(e) {
    e.preventDefault();   
    switchGPS();
} );

/* $("#cancellocation").click(function(e) {
    e.preventDefault();         
    window.location = 'obs_form.html';   
    return false; 
} ); */
