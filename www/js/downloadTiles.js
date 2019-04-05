function downloadTiles(bbox) {  
    var fetchQueue = getTileDownloadURLs(bbox);
    
    for(var i=0, len=fetchQueue.length; i<len; ++i) {
        console.log("i: " + i + " layername: " + fetchQueue[i].layerName)
        console.log("URL: " + fetchQueue[i].url);

        // download tile

        // save it to FS
            //createPath(fs, path, callback)

    }
}   

// builds directory path
function createPath(fs, path, callback) {
    var dirs = path.split("/").reverse();
    var root = fs.root;

    var createDir = function(dir) {
        if (dir.trim()!="") {
            root.getDirectory(dir, {
                create: true,
                exclusive: false
            }, success, function(dir) {
                error("failed to create dir " + dir);
            });
        } else {
            callback();
        }
    };

    var success = function(entry) {
        root = entry;
        if (dirs.length > 0) {
            createDir(dirs.pop());
        } else {
            callback();
        }
    };

    createDir(dirs.pop());
}

const lon2tile = (lon, zoom) => {
    return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}

const lat2tile = (lat, zoom) => {
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}

const tile2long = (x, zoom) => {
    return (x/Math.pow(2,zoom)*360-180);
}

const tile2lat = (y, zoom) => {
    var n=Math.PI-2*Math.PI*y/Math.pow(2,zoom);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

const getTileBbox = (x, y, zoom) => {
    const xMin = tile2long(x, zoom);
    const xMax = tile2long(x+1, zoom);
    const yMax = tile2lat(y, zoom);
    const yMin = tile2lat(y+1, zoom);

    return [xMin, yMin, xMax, yMax];
};

function getTileDownloadURLs(bbox) {
    var minZoom = 0;
    var maxZoom = 17;
    var fetchQueue = [];
    for(var zoom = minZoom; zoom <= maxZoom; ++zoom) {        
        var xMin = lon2tile(bbox._southWest.lng, zoom);
        var xMax = lon2tile(bbox._northEast.lng, zoom);
        var yMin = lat2tile(bbox._northEast.lat, zoom);
        var yMax = lat2tile(bbox._southWest.lat, zoom);
    
        for(var x=xMin; x <= xMax; ++x) {
            for(var y=yMin; y <= yMax; ++y) {
                var tileBbox = getTileBbox(x, y, zoom).join(',')
                for(let layerName of LayerDefinitions.downloadables) {
                    const layer = LayerDefinitions[layerName];
                    const urlBase = layer.url;
                    const wmsLayerName = layer.layers;
                    const format = layer.format;
                    const transparent = layer.transparent;
                    const epsg = layer.crs;
                    const version = layer.version;
                    const width = layer.width;
                    const height = layer.height;
                    var wmsParams = `REQUEST=GetMap&VERSION=${version}&SERVICE=WMS&SRS=${epsg}&WIDTH=${width}&HEIGHT=${height}&LAYERS=${wmsLayerName}&STYLES=&FORMAT=${format}&TRANSPARENT=${transparent}&BBOX=${tileBbox}`;
                    var url = `${urlBase}${wmsParams}`;
        
                    fetchQueue.push({url: url, x: x, y: y, z: zoom, layerName: layerName});
                }
            }
        }
    }
    return fetchQueue;
};

/*
    for(var i=0, len=fetchQueue.length; i<len; ++i) {
    try {
        var data = fetchQueue[i];
        var url = data.url;
        var dirPath = `${RNFS.ExternalDirectoryPath}/tiles/${data.layerName}/${data.z}/${data.x}/`;
        var filePath = `${dirPath}${data.y}.png`;

    //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fileSystem) => {console.log(fileSystem.name);}, (evt) => {console.log(evt.target.error.code);});
    const dirPath = cordova.file.dataDirectory + `/tiles/${data.layerName}/${data.z}/${data.x}/`;

    window.resolveLocalFileSystemURI(dirPath, (directoryEntry) => {console.log(directoryEntry);}, (directoryEntry) => {console.log(directoryEntry);});

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        function gotFS(fileSystem) {
            window.FS = fileSystem;

            var printDirPath = function(entry){
            console.log("Dir path - " + entry.fullPath);
            }

            createDirectory("dhaval/android/apps", printDirPath);

        console.log('file system open: ' + fs.name);
        fs.root.getFile('bot.png', { create: true, exclusive: false }, function (fileEntry) {
        console.log('fileEntry is file? ' + fileEntry.isFile.toString());
        var oReq = new XMLHttpRequest();
        // Make sure you add the domain name to the Content-Security-Policy <meta> element.
        oReq.open("GET", "http://cordova.apache.org/static/img/cordova_bot.png", true);
        // Define how you want the XHR data to come back
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var blob = oReq.response; // Note: not oReq.responseText
            if (blob) {
                // Create a URL based on the blob, and set an <img> tag's src to it.
                var url = window.URL.createObjectURL(blob);
                document.getElementById('bot-img').src = url;
                // Or read the data with a FileReader
                var reader = new FileReader();
                reader.addEventListener("loadend", function() {
                    // reader.result contains the contents of blob as text
                });
                reader.readAsText(blob);
            } else console.error('we didnt get an XHR response!');
        };
        oReq.send(null);
        }, function (err) { console.error('error getting file! ' + err); });
    }, 
    function (err) { console.error('error getting persistent fs! ' + err); });

    
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    }

    function fail() {
        console.log("failed to get filesystem");
    }




        if(!exists) {
        await RNFS.mkdir(dirPath)
        }
        try {
        var fileTransfer = new FileTransfer();

        fileTransfer.onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
            loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
            } else {
            loadingStatus.increment();
            }
        };

        fileTransfer.download(
            url,
            filePath,
            function(entry) {
            console.log("download complete: " + entry.fullPath);
            },
            function(error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
            },
            false,
            {
            headers: {
                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            }
            }
        );
        } catch(error) {
        console.log(url + " KO1 " + error)
        }
    } catch (error) {
        console.log("--------- ERR: " + error);        
    }
    }
    finishDownload(aoiName, bbox, navigation, token, currentGzId, dispatch);    
};
}
*/


function uploadAOI(token, gzId, name, bbox, dispatch) {
    try {
    const url = `${URL_GZS}${gzId}${URL_AOI_SUFFIX}`;
    let response = await instance.post(url, {
        name: name,
        x_min: bbox._southWest.lng,
        y_min: bbox._southWest.lat,
        x_max: bbox._northEast.lng,
        y_max: bbox._northEast.lat,
    });

    if( response.status === 200 ){
        dispatch({ type: ADD_NEW_AOI, payload: {aoi: response.data} });
    } else {
        Toast.show(message, Toast.LONG, Toast.CENTER, style);
    }
    } catch(e) {
    Toast.show(message, Toast.LONG, Toast.CENTER, style);
    }
}