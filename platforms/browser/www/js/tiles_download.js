function downloadTiles(bbox) {  
    var fetchQueue = getTileDownloadURLs(bbox);
    
    for(var i=0, len=fetchQueue.length; i<len; ++i) {

        var data = fetchQueue[i];

        console.log("i: " + i
                    + " layername: " + data.layerName
                    + " x: " +      data.x
                    + " y: " +      data.y
                    + " zoom: " +   data.z)

        console.log("URL: " + fetchQueue[i].url);

        // download tile
        
        var url = data.url;
        $.get( url, function( data ) {             
            console.log("Load was performed." + url);         
            console.log(data);         
            //alert( "Load was performed." + url );
        });

        //var dirPath = `${ExternalDirectoryPath}/tiles/${data.layerName}/${data.z}/${data.x}/`;
        //var filePath = `${dirPath}${data.y}.png`;

        // save it to Android FS
        //createPath(fs, dirPath, callback)

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



/*
// Xy returns the Spherical Mercator (x, y) in meters
func Xy(lngLat LngLat) (x, y float64) {
	lng := lngLat.Lng * (math.Pi / 180.0)
	lat := lngLat.Lat * (math.Pi / 180.0)
	x = 6378137.0 * lng
	y = 6378137.0 * math.Log(math.Tan((math.Pi*0.25)+(0.5*lat)))
	return x, y
}

// Ul returns the upper left (lon, lat) of a tile
func Ul(tile TileID) LngLat {
	n := math.Pow(2.0, float64(tile.Z))
	lonDeg := float64(tile.X)/n*360.0 - 180.0
	latRad := math.Atan(math.Sinh(math.Pi * (1 - 2*float64(tile.Y)/n)))
	latDeg := (180.0 / math.Pi) * latRad
	return LngLat{lonDeg, latDeg}
}

// XyBounds returns the Spherical Mercator bounding box of a tile
func XyBounds(tile TileID) Bbox {
	left, top := Xy(Ul(tile))
	nextTile := TileID{tile.X + 1, tile.Y + 1, tile.Z}
	right, bottom := Xy(Ul(nextTile))
	return Bbox{left, bottom, right, top}
}
*/

// Tile get the tile containing a longitude and latitude.
/*
function Tile(lng, lat, zoom) {
	lat = lat * (Math.Pi / 180.0);
	n = Math.pow(2.0, zoom);
	tileX = Math.floor((lng + 180.0) / 360.0 * n);
	tileY = Math.floor((1.0 - Math.log(Math.tan(lat)+(1.0/Math.cos(lat)))/Math.PI) / 2.0 * n);
	return {tileX, tileY, zoom};
}*/

const lon2tile = (lng, zoom) => {
    n = Math.pow(2.0, zoom);
    return Math.floor((lng + 180.0) / 360.0 * n);
}

const lat2tile = (lat, zoom) => {
    lat = lat * (Math.PI / 180.0);
    n = Math.pow(2.0, zoom);
    return Math.floor((1.0 - Math.log(Math.tan(lat)+(1.0/Math.cos(lat)))/Math.PI) / 2 * n);
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
    var minZoom = 2;
    var maxZoom = 19;
    var fetchQueue = [];
    for(var zoom = minZoom; zoom <= maxZoom; ++zoom) {        
        var xMin = lon2tile(bbox.xmin, zoom);
        var xMax = lon2tile(bbox.xmax, zoom);
        var yMin = lat2tile(bbox.ymin, zoom);
        var yMax = lat2tile(bbox.ymax, zoom);
    
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

