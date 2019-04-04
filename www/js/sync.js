
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

function sync_Images() {}
