document.addEventListener('deviceready', loadMap, false);

var marker;
var mymap;
var gjson_layer;
var overlays;

var customControl =  L.Control.extend({
    options: {
      position: 'topleft'
    },      
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');  
      L.DomEvent.disableClickPropagation(container);
      container.title = "Center map on current GPS position";
      container.style.backgroundColor = 'white';     
      container.style.backgroundImage = "url(file:///android_asset/www/lib/images/gps.png)";
      container.style.backgroundSize = "30px 30px";
      container.style.width = '30px';
      container.style.height = '30px';
      container.onclick = function(){
        centerMapOnCurrentPosition();
      }  
      return container;
    }
});

function loadMap() {
    document.addEventListener("backbutton", onBackKeyDown, false);

    var LayerDefinitions    = JSON.parse(   window.sessionStorage.getItem("wms_url"));
    var id_AOI              =               window.sessionStorage.getItem("id_aoi");
    var obs_latitude        =               window.sessionStorage.getItem("obs_latitude");
    var obs_longitude       =               window.sessionStorage.getItem("obs_longitude");
    var obs_id              =               window.sessionStorage.getItem("obs_id"); 
    if ((obs_id == null)  || (obs_id == '')) {
        obs_id = "NULL";
    }

    mymap = L.map('mapid');

    mymap.on('error', e => {
        // Hide those annoying non-error errors
        if (e && e.error !== 'Error: Not Found')
            console.error(e);
    });

    controlLayers = null;
    geojsonLayer = null;
    overlays = {};

    //mymap.on('load', (e) => {
    bbox = window.sessionStorage.getItem("bbox");

    var corner1 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymin")), Number(window.sessionStorage.getItem("bbox_xmin")));
    var corner2 = L.latLng(Number(window.sessionStorage.getItem("bbox_ymax")), Number(window.sessionStorage.getItem("bbox_xmax")));
    var bounds = L.latLngBounds(corner1, corner2);
    mymap.fitBounds(bounds);

    addMapControls();
    //initLayers();
    addOfflineWMSLayers(id_AOI, LayerDefinitions);
    addMyObservations(id_AOI, obs_id);

    mymap.on('click', (e) => {
        createMarker(e.latlng);
    });

    if ((obs_latitude != null) & (obs_longitude != null)) {
        createMarker(L.latLng(obs_latitude, obs_longitude));
    }
}

function createMarker(latlng_pos) {
    if (marker == null) { 
        marker = new L.marker(latlng_pos, {draggable:'true'});
        marker.setOpacity(0.7);
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

function onBackKeyDown() {
    window.location = "obs_form.html";
}

function centerMapOnCurrentPosition() {
    var onSuccess = function(position) {
        mymap.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));
        createMarker(new L.LatLng(position.coords.latitude, position.coords.longitude));
    };
    function onError(error) {
        //alert('code: '    + error.code    + '\n' +
        //      'message: ' + error.message + '\n');
        alert('Please make sure that GPS geolocation is on');
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout: 1500, enableHighAccuracy: true});
}

function initLayers() {
    var osm = new L.TileLayer(LayerDefinitions.osm.url, {maxZoom: 20, maxNativeZoom: 19, attribution: LayerDefinitions.osm.attribution});
    mymap.addLayer(osm);
    controlLayers.addBaseLayer(osm, LayerDefinitions.osm.layerName);
}

function addOfflineWMSLayers(id_AOI, LayerDefinitions) {     
    for(let layer of LayerDefinitions.DL_WMS) {         
        console.log("Adding " + layer.name);
        var ll_layer = new L.TileLayer(cordova.file.dataDirectory + "files/tiles/" + id_AOI + "/" + layer.name + "/{z}/{x}/{y}.png", {maxZoom: 20, maxNativeZoom: 19});      
        mymap.addLayer(ll_layer);
        if(controlLayers)
            controlLayers.addOverlay(ll_layer, layer.name);
        else
            overlays[layer.name] = ll_layer;
    }
}

function buildSurveyDataPopup(data) {
    var container = L.DomUtil.create('div');
    container.innerHTML = `<b>${data.name}</b><br><b>Species:&nbsp</b>${data.species}<br><b>Diameter:&nbsp</b>${data.diameter}`;
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

        var query = 'SELECT s.id AS id, s.name AS name, t.name AS treespe, c.name AS diameter, s.longitude, s.latitude '
                    +   'FROM surveydata AS s '
                    +   'INNER JOIN treespecies     AS t    on t.id = s.id_tree_species '
                    +   'INNER JOIN crowndiameter   AS c    on c.id = s.id_crown_diameter '
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
                        "popup":    buildSurveyDataPopup({"id":item.id,"name":item.name,"species":item.treespe,"diameter":item.diameter}),
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

            var gjsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            var greenIcon = L.icon({
                iconUrl: 'file:///android_asset/www/lib/images/marker-red-small.png',
                //shadowUrl: 'leaf-shadow.png',            
                iconSize:     [40, 40], // size of the icon
                //shadowSize:   [50, 64], // size of the shadow
                iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
                //shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
            });

            gjson_layer = L.geoJSON(geojson, {
                    pointToLayer: function (feature, latlng) {
                        //return L.circleMarker(latlng, gjsonMarkerOptions);
                        return L.marker(latlng, {icon: greenIcon});
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
    controlLayers = new L.control.layers({}, overlays, {sortLayers: true, hideSingleBase: true});
    controlLayers.addTo(mymap);
    mymap.addControl(new customControl());
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
        alert("Please click on the map to select a location");
    }
} );

$("#cancellocation").click(function(e) {
    e.preventDefault();         
    window.location = 'obs_form.html';   
    return false; 
} );
