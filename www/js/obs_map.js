document.addEventListener('deviceready', loadMap, false);

var areaSelect;

function loadMap() {
    var mymap = L.map('mapid');
    var controlLayers = null;
    var geojsonLayer = null;
    var overlays = {};

    mymap.on('load', (e) => {
        
        //var corner1 = L.latLng(json.bbox[0], json.bbox[1]);
        //var corner2 = L.latLng(json.bbox[2], json.bbox[3]);
        //var bounds = L.latLngBounds(corner1, corner2);
        //mymap.fitBounds(bounds);

        mymap.setView([json.latitude, json.longitude], 17);

        addMapEvents();

        addMapControls();
        
        initLayers();
        
        addOfflineLayers();
            
        addMarkers(json.obs);
        
    });
};

function initLayers() {
    var osm = new L.TileLayer(LayerDefinitions.osm.url, {maxZoom: 25, attribution: LayerDefinitions.osm.attribution});
    mymap.addLayer(osm);
    controlLayers.addBaseLayer(osm, LayerDefinitions.osm.layerName);
}

function addOfflineLayers(baseURL) {

    for(let layerName of LayerDefinitions.downloadables) {  

        console.log("Adding " + layerName);
        var layer = new L.TileLayer(`${baseURL}/tiles/${layerName}/{z}/{x}/{y}.png`, {maxZoom: 25});      
        mymap.addLayer(layer);  
        
        if(controlLayers)
            controlLayers.addOverlay(layer, layerName);
        else
            overlays[layerName] = layer;
    }
}

function addMapEvents() {
    mymap.on('contextmenu', (e) => {  
      sendDataToReact({  
        action: 'addObservation',
        latitude: e.latlng.lat,
        longitude: e.latlng.lng  
      });  
    }); 
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
