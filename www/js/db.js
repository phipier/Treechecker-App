document.addEventListener('deviceready', openDb, false);

var db;
function openDb() {
    db = window.sqlitePlugin.openDatabase({name:'treechecker.db', location:'default'});
    //db = window.sqlitePlugin.openDatabase({name:'treechecker.db', createFromLocation:1});    
};

function createTables() {
    var sqlstr; 
    sqlstr = "CREATE TABLE IF NOT EXISTS geographicalzone (id integer primary key, name varchar(255) not null, layer_name varchar(255) not null, wms_url varchar(255) not null, proj varchar(255) not null, image_url varchar(255) not null, x_min double precision not null, x_max double precision not null, y_min double precision not null, y_max double precision not null);"
    runSQL(sqlstr);
    //sqlstr = "DROP TABLE IF EXISTS aoi;"
    //runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS aoi (id integer primary key, name varchar(100) not null, x_min double precision not null, x_max double precision not null, y_min double precision not null, y_max double precision not null, creation_date date not null DEFAULT (datetime('now','localtime')), is_deleted varchar(5) not null DEFAULT 'false', geographical_zone_id integer not null, owner_id integer);"
    runSQL(sqlstr);
    //sqlstr = "DROP TABLE IF EXISTS obs;"
    //runSQL(sqlstr);

    sqlstr = "CREATE TABLE IF NOT EXISTS obs (id integer primary key, id_aoi integer, name varchar(100) not null, id_tree_species integer, id_crown_diameter integer, id_canopy_status integer, comment varchar(250) not null, longitude double precision not null, latitude double precision not null, compass integer, is_deleted varchar(5) not null DEFAULT 'false', CONSTRAINT fk_aoi FOREIGN KEY (id_aoi) REFERENCES aoi(id) ON DELETE CASCADE);"

    sqlstr = "CREATE TABLE IF NOT EXISTS obs (id integer primary key, id_aoi integer, name varchar(100) not null, id_tree_species integer, id_crown_diameter integer, id_canopy_status integer, comment varchar(250) not null, longitude double precision not null, latitude double precision not null, compass integer, is_deleted varchar(5) not null DEFAULT 'false', photo text);"

    runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS treespecies (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS crowndiameter (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS canopystatus (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
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

function delete_aoi_fromDB(id_aoi) {
    var token = window.sessionStorage.getItem("token");
    var id_aoi = window.sessionStorage.getItem("id_aoi");
    $.ajax({
        type : 'DELETE',
        crossDomain : true,
        url : SERVERURL + '/api/aois/' + id_aoi,
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
        success : function(reg) {
            db.transaction(function(tx) {
                // add DB contraint on observation?
                var sqlstr = "DELETE FROM aoi WHERE id = " + id_aoi + ";";
                tx.executeSql(sqlstr);
            }, function(error) {
                console.log('Transaction delete aoi ERROR: ' + error.message);
            }, function() {
                console.log('deleted AOI');
                // delete tiles from local storage
                deleteTiles(id_aoi);                
                window.plugins.spinnerDialog.hide();    
                window.location = 'aoi_list.html';
            });            
        },
        error : function(req, status, error) {
            window.plugins.spinnerDialog.hide();
        }
    });   
}
