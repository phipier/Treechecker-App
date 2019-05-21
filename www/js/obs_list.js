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
                        + '<a id="edit_idobs_'+id_obs+'" class="btn button button-navbar m-2"><i class="fas fa-edit fa-2x white"></i></a>'
                        + '<a id="dele_idobs_'+id_obs+'" class="btn button button-navbar m-2"><i class="fas fa-trash fa-2x white"></i></a>'
                        + '</li>';
                    }
                    html += "</ul>";
                    $("#listobs-page").html(html);
                    $("[id^=edit_idobs_]").click(function(e) {
                        e.preventDefault();
                        window.sessionStorage.setItem("edit_mode", "t");
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
        var token = window.sessionStorage.getItem("token");
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM surveydata;', [], function (tx, res) {
                for(var x = 0; x < res.rows.length; x++) {
                    var obs_name = res.rows.item(x).name;
                    var obs_comment = res.rows.item(x).comment;
                    var obs_id_tree_species = res.rows.item(x).id_tree_species;
                    var obs_id_crown_diameter = res.rows.item(x).id_crown_diameter;
                    var obs_id_canopy_status = res.rows.item(x).id_canopy_status;
                    var obs_latitude = res.rows.item(x).latitude;
                    var obs_longitude = res.rows.item(x).longitude;
                    var idaoi = res.rows.item(x).id_aoi;

                    var data = '{"name" :"' + obs_name
                               + '", "tree_specie":"' + obs_id_tree_species
                               + '", "crown_diameter":"' + obs_id_crown_diameter
                               + '", "canopy_status":"' + obs_id_canopy_status
                               + '", "comment":"' + obs_comment
                               + '", "latitude":"' + obs_latitude
                               + '", "longitude":"' + obs_longitude
                               + '"}';

                    $.ajax({
                        type: 'POST',
                        crossDomain: true,
                        url: SERVERURL + '/api/aois/' + idaoi + '/observations/',
                        headers: {
                            "Authorization": "JWT " + token,
                            "Content-Type": "application/json",
                            "cache-control": "no-cache"
                        },
                        processData: false,
                        data: data,
                        error: function(req, status, error) {
                            window.plugins.spinnerDialog.hide();
                            $('#sidebar').toggleClass('active');
                            $('.overlay').toggleClass('active');
                            if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
                                $("#errorpopupdata>p").html("");
                            }
                            $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - It was not possible to update the remote DB.</p>");
                            $('#errorpopup').modal('show');
                        }
                    });
                }
            },
            function (tx, error) {
                console.log('SELECT obs error: ' + error.message);
            });

            tx.executeSql('SELECT * FROM photo;', [], function (tx, res) {
                for(var x = 0; x < res.rows.length; x++) {
                    var photo_id_survey_data = res.rows.item(x).id_survey_data;
                    var photo_compass = res.rows.item(x).compass;
                    var photo_image = res.rows.item(x).image;

                    var data = '{"survey_data" :"' + photo_id_survey_data
                               + '", "compass":"' + photo_compass
                               + '", "image":"' + photo_image
                               + '"}';

                    $.ajax({
                        type: 'POST',
                        crossDomain: true,
                        url: SERVERURL + '/api/images/',
                        headers: {
                            "Authorization": "JWT " + token,
                            "Content-Type": "application/json",
                            "cache-control": "no-cache"
                        },
                        processData: false,
                        data: data,
                        success: function() {
                            window.plugins.spinnerDialog.hide();
                            $('#sidebar').toggleClass('active');
                            $('.overlay').toggleClass('active');
                            if(document.getElementById("successpopupdata").getElementsByTagName('p').length > 0) {
                                $("#successpopupdata>p").html("");
                            }
                            $("#successpopupdata").prepend("<p><i class='fas fa-smile'></i> Remote database updated.</p>");
                            $('#successpopup').modal('show');
                        },
                        error: function(req, status, error) {
                            window.plugins.spinnerDialog.hide();
                            $('#sidebar').toggleClass('active');
                            $('.overlay').toggleClass('active');
                            if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
                                $("#errorpopupdata>p").html("");
                            }
                            $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - It was not possible to update the remote DB.</p>");
                            $('#errorpopup').modal('show');
                        }
                    });
                }
            },
            function (tx, error) {
                console.log('SELECT photo error: ' + error.message);
            });
        }, function (error) {
            console.log('transaction obs error: ' + error.message);
        }, function () {
            console.log('transaction obs ok');

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