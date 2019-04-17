var listObs = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show(null, "loading survey data ...");
        var id_aoi = window.sessionStorage.getItem("id_aoi");

        db.transaction(function (tx) {
                var query = 'SELECT * FROM obs where id_aoi = '+id_aoi+';';
                tx.executeSql(query, [], function (tx, res) {
                    var html = "";
                    var id_obs = res.rows.item(x).id;
                    for(var x = 0; x < res.rows.length; x++) {
                        html += '<div class="card"><div class="card-body">'
                        + '<h5 class="card-title">' + res.rows.item(x).name + '</h5>'
                        + '<a id="edit_idobs_'+id_obs+'" class="btn button">edit observation</a></div></div>'
                        + '<a id="dele_idobs_'+id_obs+'" class="btn button">delete observation</a></div></div>';
                    }                    
                    $("#listobs-page").html(html);
                    $("[id^=edit_idobs_]").click(function(e) {
                        e.preventDefault(); 
                        var id_aoi = this.id.substring(11);
                        window.sessionStorage.setItem("id_obs", id_obs);                    
                        window.location = 'obs_form.html';
                        return false; 
                    });
                    $("[id^=dele_idobs_]").click(function(e) {
                        e.preventDefault(); 
                        var id_aoi = this.id.substring(11);
                        window.sessionStorage.setItem("id_obs", id_obs); 
                        delete_obs(id_obs);                   
                        window.location = 'obs_list.html';
                        return false; 
                    });
                    window.plugins.spinnerDialog.hide();
                },
                function (tx, error) {
                    console.log('SELECT observation error: ' + error.message);
                });
            }, function (error) {
                console.log('transaction observation error: ' + error.message);
            }, function () {
                console.log('transaction observation ok');
            }
        );

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

$("#addOBS").click( function(e) {
    e.preventDefault();
    window.sessionStorage.setItem("id_obs", "");
    window.sessionStorage.setItem("obsname", "");

    window.sessionStorage.setItem("latitude", "39.784352364601");
    window.sessionStorage.setItem("longitude", "-7.6377547801287");

    /*
    window.sessionStorage.setItem("bbox_xmin", "39.826");
    window.sessionStorage.setItem("bbox_xmax", "39.839");
    window.sessionStorage.setItem("bbox_ymin", "-7.713");
    window.sessionStorage.setItem("bbox_ymax", "-7.696");
    */

    window.location = 'obs_form.html';
    return false;
} );

function delete_obs(id_obs) {}

listObs.initialize();
