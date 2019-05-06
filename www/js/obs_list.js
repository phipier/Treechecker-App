var listObs = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        //window.plugins.spinnerDialog.show(null, "loading survey data ...");
        var id_aoi = window.sessionStorage.getItem("id_aoi");

        db.transaction(function (tx) {
                var query = 'SELECT * FROM obs where id_aoi = '+id_aoi+';';
                tx.executeSql(query, [], function (tx, res) {
                    var html = "";                    
                    for(var x = 0; x < res.rows.length; x++) {
                        var id_obs = res.rows.item(x).id;
                        html += '<div class="card"><div class="card-body">'
                        + '<h5 class="card-title">' + res.rows.item(x).name + '</h5>'
                        + '<a id="edit_idobs_'+id_obs+'" class="btn button">edit observation</a>'
                        + '<a id="dele_idobs_'+id_obs+'" class="btn button">delete observation</a></div></div>';
                    }                    
                    $("#listobs-page").html(html);
                    $("[id^=edit_idobs_]").click(function(e) {
                        e.preventDefault(); 
                        var id_obs = this.id.substring(11);
                        window.sessionStorage.setItem("id_obs", id_obs);                    
                        window.location = 'obs_form.html';
                        return false; 
                    });
                    $("[id^=dele_idobs_]").click(function(e) {
                        e.preventDefault(); 
                        var id_obs = this.id.substring(11);                        
                        delete_obs(id_obs);
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

        db.transaction(function (tx) {
            var query = 'SELECT * FROM aoi where id = '+id_aoi+';';
            tx.executeSql(query, [], function (tx, res) {
                window.sessionStorage.setItem("bbox_xmin", res.rows.item(0).x_min);
                window.sessionStorage.setItem("bbox_xmax", res.rows.item(0).x_max);
                window.sessionStorage.setItem("bbox_ymin", res.rows.item(0).y_min);
                window.sessionStorage.setItem("bbox_ymax", res.rows.item(0).y_max);
            },
            function (tx, error) {
                console.log('SELECT AOI error: ' + error.message);
            });
        }, function (error) {
            console.log('transaction AOI error: ' + error.message);
        }, function () {
            console.log('transaction AOI ok');
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

$("#addOBS").click( function(e) {
    e.preventDefault();
    window.sessionStorage.setItem("id_obs", "");
    window.sessionStorage.setItem("obs_name", "myobstest");
    window.sessionStorage.setItem("obs_latitude", "39.784352364601");
    window.sessionStorage.setItem("obs_longitude", "-7.6377547801287");
    window.location = 'obs_form.html';
    return false;
} );

function delete_obs(id_obs) {
    db.transaction(function(tx) {        
        var sqlstr = "DELETE FROM obs WHERE id = " + id_obs + ";";
        tx.executeSql(sqlstr);
    }, function(error) {
        console.log('Transaction delete obs ERROR: ' + error.message);
    }, function() {
        console.log('deleted obs table OK');
        window.location = 'obs_list.html';        
    });
}

listObs.initialize();
