function update() {
    update_regions();
    update_treespecies();
    update_crowndiameter();
    update_canopystatus();
    $('#sidebar').toggleClass('active');
    $('.overlay').toggleClass('active');       
}

function update_regions() {
    window.plugins.spinnerDialog.show();
    getAsync('/api/gzs/')
    .then((res) => {       
        $.each(res, function(key, val) {        
            runSQL("REPLACE INTO geographicalzone(" 
            + "id, name, wms_url, features, y_min, x_min, y_max, x_max) "
            + "VALUES("+val.key+",'"+val.name+"','"+val.wms_url+"','"+val.features+"',"
            + val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+")");
        });
        loadRegions();
    })
    .catch((error)=>{displayMessage("request to remote server failed. " + error,()=>{});})
    .finally(()=>{window.plugins.spinnerDialog.hide();})
}

function update_treespecies() {
    window.plugins.spinnerDialog.show();
    getAsync('/api/species/')
    .then((res) => {       
        $.each(res, function(key, val) {        
            runSQL("REPLACE INTO treespecies(id, name) VALUES("+val.key+",'"+val.name+"')");
        });      
    })
    .catch((error)=>{displayMessage("request to remote server failed. " + error,()=>{});})
    .finally(()=>{window.plugins.spinnerDialog.hide();})
}

function update_crowndiameter() {
    window.plugins.spinnerDialog.show();
    getAsync('/api/crowns/')
    .then((res) => {       
        $.each(res, function(key, val) {        
            runSQL("REPLACE INTO crowndiameter(id, name) VALUES("+val.key+",'"+val.name+"')");
        });      
    })
    .catch((error)=>{displayMessage("request to remote server failed. " + error,()=>{});})
    .finally(()=>{window.plugins.spinnerDialog.hide();})
}

function update_canopystatus() {
    window.plugins.spinnerDialog.show();
    getAsync('/api/canopies/')
    .then((res) => {       
        $.each(res, function(key, val) {        
            runSQL("REPLACE INTO canopystatus(id, name) VALUES("+val.key+",'"+val.name+"')");
        });      
    })
    .catch((error)=>{displayMessage("request to remote server failed. " + error,()=>{});})
    .finally(()=>{window.plugins.spinnerDialog.hide();})
}