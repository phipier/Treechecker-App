var listAOI = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var id_region = window.sessionStorage.getItem("id_region");

        db.transaction(function (tx) {
                var query = 'SELECT * FROM aoi where geographical_zone_id = '+id_region+';';
                tx.executeSql(query, [], function (tx, res) {
                    var html = "";
                    for(var x = 0; x < res.rows.length; x++) {
                        html += '<div class="card"><div class="card-body"><h5 class="card-title">' 
                        + res.rows.item(x).name
                        + '</h5><a id="la'+res.rows.item(x).id+'" class="btn button">See data</a></div></div>';
                    }                    
                    $("#listaoi-page").html(html);
                    window.plugins.spinnerDialog.hide();
                },
                function (tx, error) {
                    console.log('SELECT AOI error: ' + error.message);
                });
            }, function (error) {
                console.log('transaction AOI error: ' + error.message);
            }, function () {
                console.log('transaction AOI ok');
                $("span[id$=la]").click( function(e) {
                    e.preventDefault(); 
                    window.sessionStorage.setItem("id_aoi", e.id);
                    window.location = 'obs_list.html';
                    return false; } ); 
            }
        );

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listAOI.initialize();

$("#addAOI").click( function(e) {
    e.preventDefault();     
    window.sessionStorage.setItem("id_aoi", "");
    window.sessionStorage.setItem("aoiname", "");
    window.sessionStorage.setItem("bbox_xmin", ""); 
    window.sessionStorage.setItem("bbox_xmax", ""); 
    window.sessionStorage.setItem("bbox_ymin", ""); 
    window.sessionStorage.setItem("bbox_ymax", "");
    window.location = 'aoi_form.html';    
    return false; 
} );