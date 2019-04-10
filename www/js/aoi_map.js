document.addEventListener('deviceready', loadMap, false);

var areaSelect;

function loadMap() {
    var map = L.map('mapid').setView([39.701, -7.69], 10);

    var osm = LayerDefinitions.osm;
    L.tileLayer(        osm.url, {
        attribution:    osm.attribution,
        maxZoom:        osm.maxZoom
    }).addTo(map);

    var ortholayer = LayerDefinitions.jrcOrthophotosWMS;
    L.tileLayer.wms(    ortholayer.url, {
        layers:         ortholayer.layers,
        transparent:    ortholayer.transparent,
        format:         ortholayer.format,
        maxZoom:        ortholayer.maxZoom
    }).addTo(map);

    var pointlayer = LayerDefinitions.jrcGeometriesWMS;
    L.tileLayer.wms(    pointlayer.url, {
        layers:         pointlayer.layers,
        transparent:    pointlayer.transparent,
        format:         pointlayer.format,
        maxZoom:        pointlayer.maxZoom
    }).addTo(map);

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
