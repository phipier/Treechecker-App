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
    sqlstr = "CREATE TABLE IF NOT EXISTS aoi (id integer primary key, name varchar(100) not null, x_min double precision not null, x_max double precision not null, y_min double precision not null, y_max double precision not null, creation_date date not null DEFAULT (datetime('now','localtime')), is_deleted varchar(5) not null DEFAULT 'false', geographical_zone_id integer not null, owner_id integer);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS obs (id integer, id_aoi integer, name varchar(100) not null, id_tree_species integer, id_crown_diameter integer, id_canopy_status integer, comment varchar(250) not null, longitude double precision not null, latitude double precision not null, compass integer, is_deleted varchar(5) not null DEFAULT 'false');"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS treespecies (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS crowndiameter (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS canopystatus (id integer primary key, name varchar(100) not null);"
    runSQL(sqlstr);
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

function insert_OBS(obs_data) {
    db.transaction(function(tx) {
        var sqlstr = 
            "INSERT INTO obs(obs.name, obs.id_aoi, obs.id_tree_species, obs.id_crown_diameter, "
            + "obs.id_canopy_status, comment, longitude, latitude, compass, is_deleted) "
            + "VALUES(" + obs.name + "," + obs.id_aoi + "," + obs.id_tree_species + "," + obs.id_crown_diameter + ","
            + obs.id_canopy_status + "," + comment + "," + longitude + "," + latitude + "," + compass + ")";

        tx.executeSql(sqlstr);

    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Populated database OK');            
        // download tiles
        downloadTiles(bbox, val.key)        
    });            
}

function insert_AOI(val, id_region) {
    db.transaction(function(tx) {
        var sqlstr = 
            "INSERT INTO aoi(id, name, x_min, x_max, y_min, y_max, geographical_zone_id) "
            + "VALUES("+val.key+",'"+val.name+ "',"
            +           val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+ ","
            +           id_region+")";

        tx.executeSql(sqlstr);

    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Populated database OK');
            
        // download tiles
        downloadTiles(bbox, val.key)
        
    });
}
