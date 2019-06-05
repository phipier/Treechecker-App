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
            if ($('[id^=edit_idobs_]').length != 0) {
                window.plugins.spinnerDialog.show();
                listObs.syncObservations();
            }
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
        
        var handleError = function(error_message) {
            console.log("value promise : " + error_message);
            // display message error_message
            return Promise.reject(error_message);      
        };

        var getObservations = function(resolve, reject) {
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM surveydata;', [], function (tx, res) {       
                    var a_obs = [];                        
                    for(var x = 0; x < res.rows.length; x++) {
                        var obs = {};
                        obs.id                  = res.rows.item(x).id;
                        obs.name                = res.rows.item(x).name;
                        obs.comment             = res.rows.item(x).comment;
                        obs.id_tree_species     = res.rows.item(x).id_tree_species;
                        obs.id_crown_diameter   = res.rows.item(x).id_crown_diameter;
                        obs.id_canopy_status    = res.rows.item(x).id_canopy_status;
                        obs.latitude            = res.rows.item(x).latitude;
                        obs.longitude           = res.rows.item(x).longitude;
                        obs.id_aoi              = res.rows.item(x).id_aoi;
                        a_obs.push(obs);
                    }
                    resolve(a_obs);
                },
                function (tx, error) {
                    console.log('EXEC SQL : SELECT obs error: ' + error.message);
                    reject(error.message);
                });            
            },
            function (tx, error) {
                console.log('TRANSAC : SELECT obs error: ' + error.message);
                reject(error.message);
            });
        };

        var sendObservation = function (obs) {
            return new Promise(function(resolve, reject) {
                var data = '{"name" :"' + obs.name
                                + '", "tree_specie":"'      + obs.id_tree_species
                                + '", "crown_diameter":"'   + obs.id_crown_diameter
                                + '", "canopy_status":"'    + obs.id_canopy_status
                                + '", "comment":"'          + obs.comment
                                + '", "latitude":"'         + obs.latitude
                                + '", "longitude":"'        + obs.longitude
                                + '"}';
                $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    url: SERVERURL + '/api/aois/' + obs.id_aoi + '/observations/',
                    headers: {
                        "Authorization": "JWT " + token,
                        "Content-Type": "application/json",
                        "cache-control": "no-cache"
                    },
                    processData: false,
                    data: data,
                    success: r => {                        
                        resolve({id:r.key, lid:obs.id});
                    },
                    error: function(req, status, error) {                        
                        reject(error);                        
                    }
                });
            });
        };

        var sendPhotoforObs = function(obs) {

            return new Promise(function(resolve, reject) {

                db.transaction(function (tx) {                
                    tx.executeSql('SELECT * FROM photo where id_surveydata = ' + obs.lid + ';', [], function (tx, res) {

                        // TO DO : make this loop async
                        for(var x = 0; x < res.rows.length; x++) {
                            var photo = {};
                            photo.id_surveydata     = res.rows.item(x).id_surveydata;
                            photo.compass           = res.rows.item(x).compass;
                            photo.image             = res.rows.item(x).image;

                            var data = '{"survey_data" :"'  + obs.id
                                    + '", "compass":"'      + photo.compass
                                    + '", "image":"'        + photo.image
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
                                success: function(res) {   
                                    console.log("resolve");                                 
                                    resolve(res);
                                },
                                error: function(req, status, error) {     
                                    console.log("reject");                               
                                    reject(error.message);                                                            
                                }
                            });
                        }
                    }, function (tx, error) {
                        console.log('SELECT photo error: ' + error.message);
                    });
                });
            });
        }    

        new Promise(getObservations)
        .then((observations) => {
            console.log("sending observations ... ");  
            console.log(observations);
            var sendObs = observations.map(obs => sendObservation(obs));
            return Promise.all(sendObs);                
        }, (value) => {handleError(value);})
        .then((serverids) => {
            console.log("sending photos ... ");
            console.log(serverids);  
            var sendPhotos = serverids.map(serverid => sendPhotoforObs(serverid));
            return Promise.all(sendPhotos);
        }, (value) => {handleError(value);})
        .then((values) => {
            console.log("DONE");  
            console.log(values);
            displayMessage("Remote database updated.",()=>{});   
            console.log("deleting obs and photos ... ")               
        }, (value) => {
            displayMessage("Error - It was not possible to update the remote DB.",()=>{});
            handleError(value);
        })
        .catch(function(error) {
            console.log(error);            
        })
        .finally(function() { 
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            console.log("finally");
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
            }, function (tx, error) {
                console.log('SELECT observation error: ' + error.message);
            });

            tx.executeSql('SELECT * FROM photo where id_surveydata = ' + id_obs + ';', [], function (tx, res) {
                window.sessionStorage.setItem("photo_id",               res.rows.item(0).id);
                window.sessionStorage.setItem("photo_compass",          res.rows.item(0).compass);
                window.sessionStorage.setItem("photo_image",            res.rows.item(0).image);
                window.location = 'obs_form.html';
            }, function (tx, error) {
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
    db.transaction(function(tx) {        
        var sqlstr = "DELETE FROM photo WHERE id_surveydata = " + id_obs + ";";
        tx.executeSql(sqlstr);
    }, function(error) {
        console.log('Transaction delete photo ERROR: ' + error.message);
    }, function() {
        console.log('deleted photo table OK');
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