var tile_num;
var cur_tile_num;
var tilePC;   
var AOI_cancel = false; 
var AOI_saving = false;
var resmap;
var id_AOI;
var tiles_received = [];
var tiles_timeout = [];
var tiles_error = [];
//var tiles_abort = [];
var xhr_requests = [];
var external_storage = false;



function downloadTiles(p_id_AOI, bbox) {
    tiles_received = []; tiles_timeout = []; tiles_error = [];

    init_progress();
    var urls = getTileDownloadURLs(bbox);
    var res; id_AOI = p_id_AOI;

    // if tiles exist for this AOI id then delete them (folder)
    
    tile_num = urls.length; 
    tilePC = 100/tile_num;
    cur_tile_num = 0;

    //doesExtStorageExists().then((res)=>{
    //external_storage = res;
    resmap = urls.map((tile)=>{

        if (AOI_cancel) {return}

        var xhr = $.ajax({
            type        : 'GET',
            crossDomain : true,
            url         : tile.url, 
            cache       : false,
            xhrFields   : {responseType: 'blob'}, 
            timeout     : 1000000,  // milliseconds max to get all tiles        
            success     : 
                function(tileres, textStatus, jqXHR) {
                    if (AOI_cancel) {return}

                    tiles_received.push(tile);
                    
                    var blob = new Blob([tileres], { type: 'image/png' });

                    var dirPath     = `files/tiles/${id_AOI}/${tile.layerName}/${tile.z}/${tile.x}`;
                    var filePath    = `${tile.y}.png`;

                    window.resolveLocalFileSystemURL(external_storage?cordova.file.externalDataDirectory:cordova.file.dataDirectory, 
                        function (dirEntry) {                            
                            createPath(dirEntry, dirPath, function(dirTileEntry) {
                                saveFile(dirTileEntry, blob, filePath);                          
                            }
                        )                            
                    },  function (filerror) {
                            console.log("Failed request FS: " + filerror)
                    });                    
                },
            error       : 
                function(jqXHR, status, error) {
                    if      (status === "timeout")  { tiles_timeout.push(tile)}
                    //else if (status === "abort")    { tiles_abort.push(tile)}                   
                    else                            { tiles_error.push(tile)} 

                    if (AOI_cancel) {return}

                    update_progress();                           

                }
        });
        xhr_requests.push(xhr);
    });
    //}, (error)=>{console.log(error);});
};

function init_progress() {
    $('.progress-bar').css('width', 0+'%').attr('aria-valuenow', 0);
}

function update_progress() {
    if (AOI_saving) {
		cur_tile_num++;
		var cur_tilePC = tilePC*cur_tile_num;
		$('.progress-bar').css('width', cur_tilePC+'%').attr('aria-valuenow', cur_tilePC);
		if (cur_tile_num == tile_num) {
			exit_AOI(true,"");
		}		
    }
}

function doesExtStorageExists() {
    return new Promise(function(resolve, reject) {
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, 
            function (dirEntry) {console.log("request for external storage succeeded: " + dirEntry);    resolve(true)},
            function (filerror) {console.log("Failed request FS: " + filerror);                         resolve(false)}
        );
    })
}

function deleteTiles(id_aoi) {

    //doesExtStorageExists();

    window.resolveLocalFileSystemURL((external_storage?cordova.file.externalDataDirectory:cordova.file.dataDirectory) + "files/tiles/" + id_aoi, function (dirEntry) {
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
            console.log("file exists " + fileEntry.fullPath);
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
    if (AOI_cancel) {return}
    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
        if (AOI_cancel) {return}
        writeFile(fileEntry, fileData);
    }, function (fileError) {
        console.log("Failed save to file: " + fileError);       
    });
}

function writeFile(fileEntry, dataObj, isAppend) {
    
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            //console.log("Successful file write...");
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
        if ((dir.trim()!="") && (!AOI_cancel)) {
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
        console.log("failed to create dir " + dir);
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
    var urls = [];
    
    for (let layer of LayerDefinitions.DL_WMS) {
        var minZoom = layer.minZoom || 2; // Use layer specific minZoom if available, otherwise default to 2
        var maxZoom = layer.maxNativeZoom || 19; // Use layer specific maxZoom if available, otherwise default to 19

        for (var zoom = minZoom; zoom <= maxZoom; ++zoom) {
            var xMin = lon2tile(bbox.xmin, zoom);
            var xMax = lon2tile(bbox.xmax, zoom);
            var yMin = lat2tile(bbox.ymin, zoom);
            var yMax = lat2tile(bbox.ymax, zoom);

            for (var x = xMin; x <= xMax; ++x) {
                for (var y = yMin; y <= yMax; ++y) {
                    var tileBboxArray = getTileBbox(x, y, zoom);
                    
                    const urlBase = layer.url;
                    const wmsLayerName = layer.layers;
                    const format = layer.format;
                    const transparent = layer.transparent;
                    const epsg = layer.crs;
                    const version = layer.version;
                    const width = layer.width;
                    const height = layer.height;
                    const crsParam = version === "1.3.0" ? "CRS" : "SRS";
                    // Adjust BBOX based on version and CRS before joining into a string
                    const adjustedBbox = adjustBboxOrder(tileBboxArray, version, epsg);

                    var wmsParams = `REQUEST=GetMap&VERSION=${version}&SERVICE=WMS&${crsParam}=${epsg}&WIDTH=${width}&HEIGHT=${height}&LAYERS=${wmsLayerName}&STYLES=&FORMAT=${format}&TRANSPARENT=${transparent}&BBOX=${adjustedBbox}`;
                    var url = `${urlBase}${wmsParams}`;
                            
                    urls.push({url: url, x: x, y: y, z: zoom, layerName: wmsLayerName});
                }
            }
        }
    }

    return urls;
};


// Function to adjust BBOX ordering for version 1.3.0 with EPSG:4326
function adjustBboxOrder(bboxArray, version, epsg) {
    // For WMS 1.3.0 and EPSG:4326, switch the order to lat, lon, lat, lon
    if (version === "1.3.0" && epsg === "EPSG:4326") {
        return [bboxArray[1], bboxArray[0], bboxArray[3], bboxArray[2]].join(',');
    } else {
        // For other cases, return the bbox in the original order
        return bboxArray.join(',');
    }
}