var listObs = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var id_region = window.sessionStorage.getItem("id_aoi");

        db.transaction(function (tx) {
                var query = 'SELECT * FROM obs where id_aoi = '+id_aoi+';';
                tx.executeSql(query, [], function (tx, res) {
                    var html = "";
                    for(var x = 0; x < res.rows.length; x++) {
                        html += '<div class="card"><div class="card-body"><h5 class="card-title">' 
                        + res.rows.item(x).name
                        + '</h5><a id="la'+res.rows.item(x).id+'" class="btn button">Go</a></div></div>';
                    }                    
                    $("#listobs-page").html(html);
                    window.plugins.spinnerDialog.hide();
                },
                function (tx, error) {
                    console.log('SELECT obs error: ' + error.message);
                });
            }, function (error) {
                console.log('transaction obs error: ' + error.message);
            }, function () {
                console.log('transaction obs ok');
                $("span[id$=la]").click( function(e) {
                    e.preventDefault(); 
                    window.sessionStorage.setItem("id_obs", e.id);
                    window.location = 'map_obs.html';
                    return false; } ); 
            }
        );

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listObs.initialize();
