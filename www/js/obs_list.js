var listObs = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);        
    },
    onDeviceReady: function() {
        //window.plugins.spinnerDialog.show(null, "loading survey data ...");
        document.addEventListener("backbutton", onBackKeyDown, false);
        var id_aoi = window.sessionStorage.getItem("id_aoi");

        db.transaction(function (tx) {
                var query = 'SELECT * FROM surveydata where id_aoi = '+id_aoi+';';
                tx.executeSql(query, [], function (tx, res) {
                    var html = '<ul class="list-group">';
                    for(var x = 0; x < res.rows.length; x++) {
                        var id_obs = res.rows.item(x).id;
                        html += '<li class="list-group-item">'
                        + '<h5>' + res.rows.item(x).name + '</h5>'
                        + '<a id="edit_idobs_'+id_obs+'" class="btn button button-navbar m-2"><i class="fas fa-edit white"></i></i></a>'
                        + '<a id="dele_idobs_'+id_obs+'" class="btn button button-navbar m-2"><i class="fas fa-trash white"></a></div></div>'
                        + '</li>';
                    }
                    html += "</ul>";
                    $("#listobs-page").html(html);
                    $("[id^=edit_idobs_]").click(function(e) {
                        e.preventDefault();
                        var id_obs = this.id.substring(11);
                        edit_obs(id_obs);
                        return false;
                    });
                    $("[id^=dele_idobs_]").click(function(e) {
                        e.preventDefault(); 
                        var id_obs = this.id.substring(11);                        
                        delete_obs(id_obs);
                        $(this).closest(".list-group-item").remove();
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

        $('#sidebarCollapse').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
        });

        $('#syncobs').on('click', function() {
            window.plugins.spinnerDialog.show();
            listObs.syncObservations();
        });
    },
    onOnline: function() {
        $('#sidebarCollapse').show();
    },
    onOffline: function() {
        $('#sidebarCollapse').hide();
    },
    syncObservations: function() {
        db.transaction(function (tx) {
            var query = 'SELECT * FROM surveydata;';
            tx.executeSql(query, [], function (tx, res) {
                for(var x = 0; x < res.rows.length; x++) {
                    console.log(res.rows.item(x).name);
                }
            },
            function (tx, error) {
                console.log('SELECT obs error: ' + error.message);
            });
        }, function (error) {
            console.log('transaction obs error: ' + error.message);
        }, function () {
            console.log('transaction obs ok');
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            window.plugins.spinnerDialog.hide();
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listObs.initialize();

function onBackKeyDown() {
    window.location = "aoi_list.html";
}

function edit_obs(id_obs) {
    db.transaction(function (tx) {
            var query = 'SELECT * FROM surveydata where id = '+id_obs+';';
            tx.executeSql(query, [], function (tx, res) {                
                window.sessionStorage.setItem("obs_id",                 res.rows.item(0).id);
                window.sessionStorage.setItem("obs_name",               res.rows.item(0).name);
                window.sessionStorage.setItem("obs_comment",            res.rows.item(0).comment);
                window.sessionStorage.setItem("obs_id_tree_species",    res.rows.item(0).id_tree_species);
                window.sessionStorage.setItem("obs_id_crown_diameter",  res.rows.item(0).id_crown_diameter);
                window.sessionStorage.setItem("obs_id_canopy_status",   res.rows.item(0).id_canopy_status);
                window.sessionStorage.setItem("obs_latitude",           res.rows.item(0).latitude);
                window.sessionStorage.setItem("obs_longitude",          res.rows.item(0).longitude);
            },
            function (tx, error) {
                console.log('SELECT observation error: ' + error.message);
            });

            tx.executeSql('SELECT * FROM photo where id_survey_data = '+id_obs+';', [], function (tx, res) {
                window.sessionStorage.setItem("photo_id",               res.rows.item(0).id);
                window.sessionStorage.setItem("photo_compass",          res.rows.item(0).compass);
                window.sessionStorage.setItem("photo_image",            res.rows.item(0).image);
                window.location = 'obs_form.html';
            },
            function (tx, error) {
                console.log('SELECT photo error: ' + error.message);
            });
        }, function (error) {
            console.log('transaction observation_photo error: ' + error.message);
        }, function () {
            console.log('transaction observation_photo ok');
        }
    );
}

function delete_obs(id_obs) {
    db.transaction(function(tx) {        
        var sqlstr = "DELETE FROM surveydata WHERE id = " + id_obs + ";";
        tx.executeSql(sqlstr);
    }, function(error) {
        console.log('Transaction delete obs ERROR: ' + error.message);
    }, function() {
        console.log('deleted obs table OK');
    });
}

$("#addOBS").click(function(e) {
    e.preventDefault();
    window.sessionStorage.setItem("obs_id", "");
    window.sessionStorage.setItem("obs_name", "myobstest");
    window.sessionStorage.setItem("obs_latitude", "39.784352364601");
    window.sessionStorage.setItem("obs_longitude", "-7.6377547801287");

    window.sessionStorage.setItem("updating","false");
    window.location = 'obs_form.html';
    return false;
});