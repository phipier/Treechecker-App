document.addEventListener('deviceready', loadMap, false);

var areaSelect;

function loadMap() {
    var map = L.map('mapid').setView([39.701, -7.69], 10);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 21
    }).addTo(map);

    L.tileLayer.wms('http://cidportal.jrc.ec.europa.eu/jeodpp/services/ows/wms/canhemon/portugal?', {
        layers: 'WV3_20161222',
        transparent: true,
        format: 'image/png',
        maxZoom: 21
    }).addTo(map);

    L.tileLayer.wms('http://cidportal.jrc.ec.europa.eu/jeodpp/services/ows/wms/canhemon/portugal?', {
        layers: 'branco_maxent',
        transparent: true,
        format: 'image/png',
        maxZoom: 21
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
    window.sessionStorage.setItem("bbox_ymin", bounds.getSouthWest().lat); 
    window.sessionStorage.setItem("bbox_ymax", bounds.getNorthEast().lat);        

    window.location = 'aoi_form.html';   
    return false; 
} );
