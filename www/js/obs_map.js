document.addEventListener('deviceready', loadMap, false);

var areaSelect;
var marker;
var mymap;
var geojsonLayer;
var overlays;

function loadMap() {
    mymap = L.map('mapid');
    controlLayers = null;
    geojsonLayer = null;
    overlays = {};

    //mymap.on('load', (e) => {
    bbox = window.sessionStorage.getItem("bbox");

    var corner1 = L.latLng(json.bbox[0], json.bbox[1]);
    var corner2 = L.latLng(json.bbox[2], json.bbox[3]);
    var bounds = L.latLngBounds(corner1, corner2);
    mymap.fitBounds(bounds);

    //mymap.setView([json.latitude, json.longitude], 17);

    //addMapControls();        
    initLayers();           
    addOfflineLayers();            
        //addMarkers(json.obs);        
    //});

    mymap.on('click', (e) => {
        marker = new L.marker(e.latlng, {draggable:'true'});
        marker.on('dragend', function(event){
          var marker = event.target;
          var position = marker.getLatLng();
          marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
          map.panTo(new L.LatLng(position.lat, position.lng))
        });
        map.addLayer(marker);
    });
}

function initLayers() {
    var osm = new L.TileLayer(LayerDefinitions.osm.url, {maxZoom: 25, attribution: LayerDefinitions.osm.attribution});
    mymap.addLayer(osm);
    controlLayers.addBaseLayer(osm, LayerDefinitions.osm.layerName);
}

function addOfflineLayers(baseURL) {

    for(let layerName of LayerDefinitions.downloadables) {
        console.log("Adding " + layerName);
        var layer = new L.TileLayer( cordova.file.dataDirectory + "files/tiles/" + id_AOI + "/" + layerName + "/{z}/{x}/{y}.png", 
                                {maxZoom: 25});      
        mymap.addLayer(layer);        
        if(controlLayers)
            controlLayers.addOverlay(layer, layerName);
        else
            overlays[layerName] = layer;
    }
}

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
  
$("#savelocation").click(function(e) {
    e.preventDefault();     
   
    window.sessionStorage.setItem("obs_latitude", marker.getLatLng().lat); 
    window.sessionStorage.setItem("obs_longitude", bounds.getLatLng().lng); 
    
    console.log("selected location: lat " + marker.getLatLng().lat + " lng " + marker.getLatLng().lng); 

    window.location = 'obs_form.html';   
    return false; 
} );
