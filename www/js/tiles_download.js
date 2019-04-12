function downloadTiles(bbox) {  
    var fetchQueue = getTileDownloadURLs(bbox);
    
    //for(var i=0, len=fetchQueue.length; i<len; ++i) {
    for(var i=0, len=5; i<len; ++i) {

        var data = fetchQueue[i];

        console.log("i: " + i
                    + " layername: " + data.layerName
                    + " x: " +      data.x
                    + " y: " +      data.y
                    + " zoom: " +   data.z)

        console.log("URL: " + fetchQueue[i].url);

        //deleteFile(dirEntry, "downloadedTile_"+data.z+"_"+data.x+"_"+data.y+".png");

        var makeRequest = function(data) {
            // download tile
            var url = data.url;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onload = function() {
                if (this.status == 200) {                
                    var blob = new Blob([this.response], { type: 'image/png' });
                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
                        var dirPath = `tiles/${data.layerName}/${data.z}/${data.x}`;
                        var filePath = `${data.y}.png`;
                        createPath(dirEntry, dirPath, function(dirTileEntry) {
                            saveFile(dirTileEntry, blob, filePath);
                        })                        
                    }, function (filerror) {console.log("Failed request FS: " + filerror)});                
                }
            };
            xhr.send();
        };
        makeRequest(data);
    }
}   

function deleteFile(dirEntry, fileName) {
    dirEntry.getFile(fileName, {create:false}, function(fileEntry) {
        console.log(fileEntry.fullPath);
        fileEntry.remove(function(){
            console.log("file deleted successfully");
        },function(error){
            console.log("Failed deleting file" + error);
            // Error deleting the file
        },function(){
            console.log("file doesn't exist");
            // The file doesn't exist
        });
    });
}

function saveFile(dirEntry, fileData, fileName) {
    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        writeFile(fileEntry, fileData);
    }, function (filerror) {console.log("Failed save to file: " + filerror)});
}

function writeFile(fileEntry, dataObj, isAppend) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            if (dataObj.type == "image/png") {
                readBinaryFile(fileEntry);
            }
            else {
                readFile(fileEntry);
            }
        };

        fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
        };

        fileWriter.write(dataObj);
    });
}

function readBinaryFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {

            console.log("Successful file write: " + this.result);
            console.log(fileEntry.fullPath + ": " + this.result);

            //var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
            //displayImage(blob);
        };
        reader.readAsArrayBuffer(file);

    }, function (filerror) {console.log("Failed save to file: " + filerror)});
}

// builds directory path
function createPath(dirEntry, path, finalCB) {
    var dirs = path.split("/").reverse();
    var dirE = dirEntry;    

    var createDir = function(dir) {
        if (dir.trim()!="") {
            dirE.getDirectory(dir, {
                create: true,
                exclusive: false
            }, success, function(dir) {
                error("failed to create dir " + dir);
            });
        } 
    };

    var success = function(entry) {
        dirE = entry;
        if (dirs.length > 0) {
            createDir(dirs.pop());
        } else{
            finalCB(dirE);
        }
    };

    createDir(dirs.pop());
    return dirE;
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