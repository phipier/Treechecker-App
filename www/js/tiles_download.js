var tile_num;
var cur_tile_num;
var tilePC;   
var AOI_cancel = false; 
var tile_downloading = false;

function downloadTiles(id_AOI, bbox) {
    init_progress();
    
    var fetchQueue = getTileDownloadURLs(bbox);

    var deleteFile_flag = false;

    // if tiles exist for this AOI id then delete them (folder)    
     
    tile_num = fetchQueue.length;
    tilePC = 100/tile_num;
    cur_tile_num = 0;
    
    for(var i=0, len=fetchQueue.length; i<len; ++i) {
    //for(var i=0, len=5; i<len; ++i) {
        if (!AOI_cancel) {   

            var data = fetchQueue[i];
            
            console.log("i: " + i
                        + " layername: " + data.layerName
                        + " x: " +      data.x
                        + " y: " +      data.y
                        + " zoom: " +   data.z)

            console.log("URL: " + fetchQueue[i].url);

            var dirPath = `files/tiles/${id_AOI}/${data.layerName}/${data.z}/${data.x}`;
            var filePath = `${data.y}.png`;
            var fileName = dirPath+"/"+filePath;

            //if (!fileExists(fileName)) {         
        
                var makeRequest = function(dataURL, dirPath, filePath) {
                    // download tile
                    var url = dataURL;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'blob';
                    xhr.onload = function() {
                        if ((!AOI_cancel) && (this.status == 200)) {      
                            var blob = new Blob([this.response], { type: 'image/png' });
                            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
                                if (!AOI_cancel) {                                
                                    console.log("fileName: "+fileName);
                                    createPath(dirEntry, dirPath, function(dirTileEntry) {
                                        saveFile(dirTileEntry, blob, filePath);                                    
                                    })
                                } else {update_progress()}
                            }, function (filerror) {console.log("Failed request FS: " + filerror)});                
                        } else {update_progress()}
                    };
                    xhr.send();
                };
                if (!AOI_cancel) {makeRequest(data.url, dirPath, filePath);} else {return}
            //};
        } else {
            return;
        }
    };
};

function init_progress() {
    $('.progress-bar').css('width', 0+'%').attr('aria-valuenow', 0);
}

function update_progress() {
    if (tile_downloading) {
        if (!AOI_cancel) {
            cur_tile_num++;
            var cur_tilePC = tilePC*cur_tile_num;
            $('.progress-bar').css('width', cur_tilePC+'%').attr('aria-valuenow', cur_tilePC);
            if (cur_tile_num == tile_num) {
                exit_AOI(true,"");
            }
        } else {
            tile_downloading = false;
            exit_AOI(false,"AOI creation canceled.");
        }
    }
}

function deleteTiles(id_aoi) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "files/tiles/" + id_aoi, function (dirEntry) {
        var success = function(parent) {
            console.log("Remove Recursively Succeeded");
        }
        var fail = function(error) {
            alert("Failed to remove directory or it's contents: " + error.code);
        }
        // remove the tiles directory
        dirEntry.removeRecursively(success, fail);

    }, function (filerror) {console.log("Failed request FS: " + filerror)}); 
}

function fileExists(fileName) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {        
        console.log("exists? "+fileName);
        dirEntry.getFile(fileName, {create:false}, function(fileEntry) {
            console.log("file exists "+fileEntry.fullPath);
        }, function(fileEntry) {
            console.log("file doesn't exist "+fileEntry.fullPath);
        });
    }, function (fileError) {console.log("Failed request FS: " + fileError)});
}

function deleteFile(fileName) {

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
        
        console.log("deleting "+fileName);

        dirEntry.getFile(fileName, {create:false}, function(fileEntry) {
            
            fileEntry.remove(function(){
                console.log("file deleted successfully "+fileName);
            },function(error){
                console.log("Failed deleting file" + error);
                // Error deleting the file
            },function(){
                console.log("file doesn't exist "+fileName);
                // The file doesn't exist
            });
        });

    }, function (filerror) {console.log("Failed request FS: " + filerror)});

}

function saveFile(dirEntry, fileData, fileName) {
    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        if (!AOI_cancel) { writeFile(fileEntry, fileData); } else {return}
    }, function (fileError) {
        console.log("Failed save to file: " + fileError);       
    });
}

function writeFile(fileEntry, dataObj, isAppend) {
    
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            update_progress();
            /*if (dataObj.type == "image/png") {
                readBinaryFile(fileEntry);
            }
            else {
                readFile(fileEntry);
            }*/
        };

        fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
        };

        fileWriter.write(dataObj);
    });
}

/*function readBinaryFile(fileEntry) {

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
}*/

// builds directory path
function createPath(dirEntry, path, finalCB) {
    var dirs = path.split("/").reverse();
    var dirE = dirEntry;    

    var createDir = function(dir) {
        if (dir.trim()!="") {
            dirE.getDirectory(dir, {
                create: true,
                exclusive: false
            }, success, failed);
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

    var failed = function(dir) {
        error("failed to create dir " + dir);
        return false;     
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
    var LayerDefinitions = JSON.parse(window.sessionStorage.getItem("wms_url"));
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
                for(let layer of LayerDefinitions.DL_WMS) {                    
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
        
                    fetchQueue.push({url: url, x: x, y: y, z: zoom, layerName: wmsLayerName});
                }
            }
        }
    }
    return fetchQueue;
};