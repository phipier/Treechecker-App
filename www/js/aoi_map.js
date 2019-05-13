document.addEventListener('deviceready', loadMap, false);

var areaSelect;

function loadMap() {
    var map = L.map('mapid')  //.setView([39.701, -7.69], 10);

    var osm = LayerDefinitions.osm;
    L.tileLayer(        osm.url, {
        attribution:    osm.attribution,
        maxZoom:        osm.maxZoom
    }).addTo(map);

    var ortholayer = LayerDefinitions.jrcOrthophotosWMS;
    var l_ortho = L.tileLayer.wms(    ortholayer.url, {
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
        //map.setView([39.701, -7.69], 10);
        map.fitBounds(l_ortho.getBounds());
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
