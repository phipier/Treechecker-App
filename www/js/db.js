document.addEventListener('deviceready', openDb, false);

var db;
function openDb() {
    db = window.sqlitePlugin.openDatabase({name:'treechecker.db', location:'default'});
    runSQL("PRAGMA foreign_keys = ON;")
    //db = window.sqlitePlugin.openDatabase({name:'treechecker.db', createFromLocation:1});    
};

function createTables() {
    var sqlstr; 
    /* sqlstr = "DROP TABLE IF EXISTS treespecies;"
    runSQL(sqlstr);  */     
    sqlstr = "CREATE TABLE IF NOT EXISTS treespecies "
            + "(id integer primary key, "
            + " name varchar(100) not null UNIQUE);"
    runSQL(sqlstr);
    /* 
    sqlstr = "DROP TABLE IF EXISTS crowndiameter;"
    runSQL(sqlstr); */
    sqlstr = "CREATE TABLE IF NOT EXISTS crowndiameter "
            + "(id integer primary key, "
            + "name varchar(100) not null UNIQUE);"
    runSQL(sqlstr);
    /* 
    sqlstr = "DROP TABLE IF EXISTS canopystatus;"
    runSQL(sqlstr); */
    sqlstr = "CREATE TABLE IF NOT EXISTS canopystatus "
            + "(id integer primary key, "
            + "name varchar(100) not null);"
    runSQL(sqlstr);    
    //sqlstr = "DROP TABLE IF EXISTS geographicalzone;"
    //runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS geographicalzone "
            + "(id integer primary key, "
            + " name varchar(255) not null, "
            + " wms_url varchar(255) not null, "
            + " features varchar(255) not null, "
            + "x_min double precision not null, x_max double precision not null, "
            + "y_min double precision not null, y_max double precision not null);"
    runSQL(sqlstr);
    //sqlstr = "DROP TABLE IF EXISTS aoi;"
    //runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS aoi "
            + "(id integer primary key, name varchar(100) not null, "
            + "x_min double precision not null, x_max double precision not null, "
            + "y_min double precision not null, y_max double precision not null, "
            + "creation_date date not null DEFAULT (datetime('now','localtime')), "
            + "is_deleted varchar(5) not null DEFAULT 'false', "
            + "geographical_zone_id integer not null REFERENCES geographicalzone(id), "
            + "owner_id integer);"
    runSQL(sqlstr);
    //sqlstr = "DROP TABLE IF EXISTS surveydata;"
    //runSQL(sqlstr); 
    sqlstr = "CREATE TABLE IF NOT EXISTS surveydata"
            + " (id integer primary key, name varchar(255) not null,"
            + " id_tree_species integer                 REFERENCES treespecies(id)      ON UPDATE CASCADE, "
            + " id_crown_diameter integer               REFERENCES crowndiameter(id)    ON UPDATE CASCADE, "
            + " id_canopy_status integer not null       REFERENCES canopystatus(id)     ON UPDATE CASCADE, "
            + " comment text, id_aoi integer not null   REFERENCES aoi(id)              ON UPDATE CASCADE ON DELETE CASCADE, "
            + " longitude double precision not null, "
            + " latitude double precision not null,"
            + " uploaded integer);"
    runSQL(sqlstr);

    //sqlstr = "DROP TABLE IF EXISTS photo;"
    //runSQL(sqlstr);
    sqlstr = "CREATE TABLE IF NOT EXISTS photo"
            +   " (id integer primary key,"
            +   " id_surveydata integer REFERENCES surveydata(id) ON DELETE CASCADE,"
            +   " compass double precision,"
            +   " image text not null,"
            +   " comment text);"
    runSQL(sqlstr);

    sqlstr = "CREATE TABLE IF NOT EXISTS photo_tmp "
            +   "(id integer primary key, "
            +   "id_surveydata integer not null REFERENCES surveydata(id), "
            +   "compass double precision, image text not null, "
            +   "comment text);"
    runSQL(sqlstr);
}

function handleError(value) {
    console.log("error message : " + value); 
    displayMessage("An error occured - " + value,()=>{});
};

function runSQL(query) {
    db.transaction(function (tx) {       
        tx.executeSql(query, [], function (tx, res) {            
            return res;
        },
        function (tx, error) {
            handleError(error.message);            
        });
    }, function (error) {
        handleError(error.message);
    }, function () {
    });
}

function runSQL2(query) {
    return new Promise(function(resolve, reject) {
        db.transaction(function (tx) {       
            tx.executeSql(query, [], function (tx, res) {            
                resolve(res);
            },
            function (tx, error) {                
                reject(error.message);
            });
        }, function (error) {
            reject(error.message);
        }, function () {            
        });
    });
}
