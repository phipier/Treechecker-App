document.addEventListener('deviceready', loadMap, false);

var marker;
var mymap;
var geojsonLayer;
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
    addOfflineLayers();        
    //addMarkers(json.obs); 

    mymap.on('click', (e) => {
        createMarker(e.latlng);
    });
}

function createMarker(latlng_pos) {
    if (marker == null) { 
        marker = new L.marker(latlng_pos, {draggable:'true'});
        marker.setOpacity(0.7);
        marker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            //marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
            marker.setLatLng(position ,{draggable:'true'});
            //mymap.panTo(new L.LatLng(position.lat, position.lng));
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

function addOfflineLayers(baseURL) {
    var id_AOI = window.sessionStorage.getItem("id_aoi");
    for(let layerName of LayerDefinitions.downloadables) {
        console.log("Adding " + layerName);
        var layer = new L.TileLayer(cordova.file.dataDirectory + "files/tiles/" + id_AOI + "/" + layerName + "/{z}/{x}/{y}.png", {maxZoom: 20, maxNativeZoom: 19});      
        mymap.addLayer(layer);        
        if(controlLayers)
            controlLayers.addOverlay(layer, layerName);
        else
            overlays[layerName] = layer;
    }
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

/* Could be useful to show all observations on same map for a given AOI 

function addMarkers(data) {

    const geojson = {  
      "type": "FeatureCollection",
      "features": []  
    };
  
    for(let index in data) {  
        const point = data[index];
        const geojsonPoint = {    
            "type": "Feature",
            "geometry": {
            "type": "Point",
            "coordinates": [point.position.longitude, point.position.latitude]
            },
            "properties": {
            "popup": buildSurveyDataPopup(point),
            "id": point.key
            }    
        };  
        geojson.features.push(geojsonPoint);  
    }

    if(geojsonLayer != null) {
        controlLayers.removeLayer(geojsonLayer);
        mymap.removeLayer(geojsonLayer);
    }

    geojsonLayer = L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.popup);
        }
    });    
    geojsonLayer.addTo(mymap);
    controlLayers.addOverlay(geojsonLayer, 'Own data');
}

function buildSurveyDataPopup(data) {
    var container = L.DomUtil.create('div');
    container.innerHTML = `<h2>${data.name}</h2><p><b>Specie:</b>${data.tree_specie.name}</p><p><b>Diameter:</b>${data.crown_diameter.name}</p>`;
    var btn = L.DomUtil.create('i', 'fa fa-info-circle fa-2x centered', container);
    L.DomEvent.on(btn, 'click', () => {
        viewElement(data.key)
    });
    return container;  
}
*/