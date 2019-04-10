//const SERVERURL = 'http://10.0.2.2:8000';
//const SERVERURL : 'http://127.0.0.1:8001',
//const SERVERURL = 'https://treechecker.ies.jrc.it';
//const SERVERURL = 'http://0e097f6f.gclientes.com';
const SERVERURL = 'http://192.168.43.148:8000';
//const SERVERURL = 'http://10.191.240.1:8000';

const LayerDefinitions = {

    osm: {
            layerName: 'OSM',
            // url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
             url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
            attribution : 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    },
    jrcOrthophotosWMS : {
            url: 'http://cidportal.jrc.ec.europa.eu/jeodpp/services/ows/wms/canhemon/portugal?',
            layers: 'WV3_20161222',
            format: 'image/png',
            transparent: 'true',
            version: '1.1.0',
            height: 512,
            width: 512,
            crs: 'EPSG:4326',
    },
    jrcGeometriesWMS : {
            url: 'http://cidportal.jrc.ec.europa.eu/jeodpp/services/ows/wms/canhemon/portugal?',
            layers: 'branco_maxent',
            format: 'image/png',
            transparent: 'true',
            version: '1.1.0',
            height: 512,
            width: 512,
            crs: 'EPSG:4326',
    },
    downloadables: ['jrcOrthophotosWMS','jrcGeometriesWMS']

}
