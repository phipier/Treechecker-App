document.addEventListener('deviceready', loadMap, false);

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

    var areaSelect = L.areaSelect({width:200, height:200});
    areaSelect.on("change", function() {
        var bounds = this.getBounds();
        console.log(bounds);
      //  $("#bbox_result").text(bounds.getSouthWest().lat + ", " + bounds.getSouthWest().lng + ", " + bounds.getNorthEast().lat + ", " + bounds.getNorthEast().lng);
    });
    areaSelect.addTo(map);
};

function addAOI() {
    downloadTiles();

}