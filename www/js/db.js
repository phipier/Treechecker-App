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
    //sqlstr = "DROP TABLE IF EXISTS obs;"
    //runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS obs (id integer primary key, id_aoi integer, name varchar(100) not null, id_tree_species integer, id_crown_diameter integer, id_canopy_status integer, comment varchar(250) not null, longitude double precision not null, latitude double precision not null, compass integer, is_deleted varchar(5) not null DEFAULT 'false');"
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




/*
    var obs.data =  '{"name" :"'    + $("#InputOBSname").text
                + '", "id_aoi":"'               + id_aoi
                + '", "id_tree_species":"'      + $("#InputSelectSpecies").children("option:selected").val()
                + '", "id_crown_diameter":"'    + $("#InputSelectCrown").children("option:selected").val()
                + '", "id_canopy_status":"'     + $("#InputSelectStatus").children("option:selected").val()
                + '", "comment":"'              + $("#InputOBScomment").text
                + '", "latitude":"'             + Number($("#Inputlatitude").text) 
                + '", "longitude":"'            + Number($("#Inputlongitude").text) 
                + '", "compass":"'              + Number($("#Inputcompass").text) + '"}';
*/