
function update() {
    update_regions();
    update_canopystatus();
    update_crowndiameter();
    update_treespecies();   
}

function synchronize() {
    sync_AOIandOBS();
    sync_Images();
}

function update_regions() {
    $.ajax({
        type : 'GET',
        crossDomain : true,
        url : URLSERVER + '/api/gzs/',
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

function sync_AOIandOBS() {
    // AOI

        // SERVER actions
        // mark as "deleted" in server DB all AOI marked as "deleted" in local DB (+ delete from local DB)
        // insert records from localDB where local id does not exists 

        // LOCAL actions
        // Delete in local DB all AOI marked as "deleted" in server DB
        // insert records from ServerDB where local id does not exists

    // Survey observations

        // SERVER actions
        // mark as "deleted" in server DB all OBS marked as "deleted" in local DB (+ delete from local DB)
        // replace (update) OBS to server DB where id_local = id_server AND (server DB update date < locate DB update date) AND NOT deleted
        // insert records from ServerDB where local id does not exists

        // LOCAL actions
        // delete OBS in local DB marked as "deleted" in server DB
        // replace (update) all records in local DB from server DB where id_local = id_server AND (server DB update date > locate DB update date) and NOT deleted
        // insert records from ServerDB where local id does not exists
   
}

function sync_Images() {}
