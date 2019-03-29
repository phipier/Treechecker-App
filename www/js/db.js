document.addEventListener('deviceready', openDb, false);

var db;
function openDb() {
    db = window.sqlitePlugin.openDatabase({name:'treechecker.db', location:'default'});
};

getRegions = function(fn) {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM geographicalzone', [], fn);
    });
};