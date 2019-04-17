
function update() {
    update_regions();
    update_canopystatus();
    update_crowndiameter();
    update_treespecies();   
}

function synchronize() {
    sync_AOIandObservations();
    sync_Images();
}

function update_regions() {
    var token = window.sessionStorage.getItem("token");
    $.ajax({
        type : 'GET',
        crossDomain : true,
        url : SERVERURL + '/api/gzs/',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
        success : function(reg) {
            $.each(reg, function(key, val) {
                db.transaction(function(tx) {
                    
                    var sqlstr = "REPLACE INTO geographicalzone("
                    + "id, name, layer_name, wms_url, proj, image_url, x_min, x_max, y_min, y_max) "
                    + "VALUES("+val.key+",'"+val.name+"','layer_name','wms_url','proj'"+",'"+val.image_url
                    + "',"+val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+")";

                    tx.executeSql(sqlstr);                            
                }, function(error) {
                    console.log('Transaction ERROR: ' + error.message);
                }, function() {
                    console.log('Populated database OK');
                });
            });
            window.plugins.spinnerDialog.hide();
        },
        error : function(req, status, error) {
            window.plugins.spinnerDialog.hide();
            console.log("no connection to DB");
        }
    });
}

function update_canopystatus() {}
function update_crowndiameter() {}
function update_treespecies() {}

function sync_AOIandObservations() {
    // AOI

        // SERVER actions
        // mark as "deleted" in server DB all AOI marked as "deleted" in local DB (+ delete records marked as "deleted" from local DB)
        // insert records into server DB from local DB where local id does not exist (new records)
        // updates all AOI records from server (in order to update local ids with server ids)

        // LOCAL actions
        // Delete in local DB all AOI marked as "deleted" in server DB
        // insert records from ServerDB where local id does not exist

    // Survey observations

        // SERVER actions
        // mark as "deleted" in server DB all OBS marked as "deleted" in local DB (+ delete records marked as "deleted" from local DB)
        // replace (update) OBS to server DB where id_local = id_server AND (server DB update date < locate DB update date) AND NOT deleted
        // insert records from ServerDB where local id does not exists

        // LOCAL actions
        // delete OBS in local DB marked as "deleted" in server DB
        // replace (update) all records in local DB from server DB where id_local = id_server AND (server DB update date > locate DB update date) and NOT deleted
        // insert records from ServerDB where local id does not exists
   
}

function sync_Images() {}


function createTables() {
    var sqlstr;
    //checkIftableexists("geographicalzone");    
    sqlstr = "CREATE TABLE geographicalzone (id integer primary key, name varchar(255) not null, layer_name varchar(255) not null, wms_url varchar(255) not null, proj varchar(255) not null, image_url varchar(255) not null, x_min double precision not null, x_max double precision not null, y_min double precision not null, y_max double precision not null);"
    runSQL(sqlstr);
    //checkIftableexists("aoi");
    sqlstr = "CREATE TABLE aoi (id integer primary key, name varchar(100) not null, x_min double precision not null, x_max double precision not null, y_min double precision not null, y_max double precision not null, is_deleted varchar(5) not null DEFAULT 'false', geographical_zone_id integer not null, owner_id integer);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE obs (id integer primary key, aoi_id integer, name varchar(100) not null, tree_specie_id integer, crown_diameter_id integer, canopy_status_id integer, comment varchar(250) not null, longitude double precision not null, latitude double precision not null, compass integer, is_deleted varchar(5) not null DEFAULT 'false');"
    runSQL(sqlstr);

    var res = runSQL(sqlstr);
}

function checkIftableexists(tablename) {
    db.transaction(function (tx) {
        var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='{"+tablename+"}';";
        tx.executeSql(query, [], function (tx, res) {   
            return res;
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });
}

function runSQL(query) {
    db.transaction(function (tx) {       
        tx.executeSql(query, [], function (tx, res) {            
            return res;
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });
}


/*
let response = await instance.get(`${URL_GZS}${currentGzId}${URL_AOI_SUFFIX}`);

for (let aoi of response.data) {

  let newObsList = {};

  if (allAoisList[currentGzId][aoi.key]) {
    let storedAoiObs = allAoisList[currentGzId][aoi.key].obs;

    for (let o of aoi.obs) {
      if(storedAoiObs[o.key] && storedAoiObs[o.key].toSync){
        newObsList[o.key] = storedAoiObs[o.key];
      }else{
          newObsList[o.key] = o;
      }
    }
    allAoisList[currentGzId][aoi.key].obs = newObsList;
  } else {
    let obsList = {};
    for(let o of aoi.obs){
      let imgList = {};
      for(let i of o.images){
        imgList[i.key] = i;

        try {
          let respObsImage = await RNFS.downloadFile({
            fromUrl: `${URL_STATIC}${i.url}`,
            toFile: `${RNFS.ExternalDirectoryPath}/pictures${i.url}`
          });
        } catch(e) {
          console.debug('error rnfs download image obs', e);
        }

      }
      o.images = imgList;
      o.toSync = false;
      obsList[o.key] = o;
    }

    aoi.obs = obsList;
    allAoisList[currentGzId][aoi.key] = aoi;
  }
}
*/