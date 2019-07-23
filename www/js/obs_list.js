var listObs = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);        
    },
    onDeviceReady: function() {
        clearWSitems_obs();
        document.addEventListener("backbutton", onBackKeyDown, false);
        var id_aoi = window.sessionStorage.getItem("id_aoi");        

        db.transaction(function (tx) {
                var query = 'SELECT * FROM surveydata where id_aoi = '+id_aoi+';';
                tx.executeSql(query, [], function (tx, res) {
                    var html = '<ul class="list-group">';
                    for(var x = 0; x < res.rows.length; x++) {
                        var id_obs = res.rows.item(x).id;
                        html += '<li class="list-group-item d-flex align-items-center py-1">'
                        + '<div class="mr-auto p-1"><h5>' + res.rows.item(x).name + '</h5></div>';                        
                        if (res.rows.item(x).uploaded == 1) {
                            html += '<div class="p-1"><i class="fas fa-clipboard-check fa-2x green"></i></div>'  //fa-check-circle 
                                    + '<div class="p-1"><a id="edit_idobs_'+id_obs+'" class="btn button button-listitem">'
                                    + '<i class="fas fa-eye fa-2x white"></i></a></div>'
                        } else {
                            html += '<div class="p-1"><a id="edit_idobs_'+id_obs+'" class="btn button button-listitem">'
                                    + '<i class="fas fa-edit fa-2x white"></i></a></div>'
                        }                        
                        html += '<div class="p-1"><a id="dele_idobs_'+id_obs+'" data-uploaded="'+res.rows.item(x).uploaded+'" class="btn button button-listitem">'
                            + '<i class="fas fa-trash fa-2x white"></i></a></div>'
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
                        if (this.dataset.uploaded=="0") { 
                            displayMessage("This observation was not uploaded. Are you sure you want to delete it?",
                                            ()=>{delete_obs(id_obs);},
                                            ()=>{});      
                            //$(this).closest(".list-group-item").remove();
                            return false;
                        } else {
                            delete_obs(id_obs);  
                        }
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

        $('#viewmap').on('click', function() {
            window.sessionStorage.setItem("obslist", "True");
            window.location = "obs_map.html";
            return false;
        });
        
        $('#syncobs').on('click', function() {          
            window.plugins.spinnerDialog.show(null, "uploading survey data ...");
            listObs.syncObservations();
            return false;
        });
        
        $('#deleteObs').on('click', function() {
            window.plugins.spinnerDialog.show(null, "deleting survey data ...");
            var id_aoi = window.sessionStorage.getItem("id_aoi");
            listObs.deleteOBS(id_aoi);            
            return false;
        });
    },
    onOnline: function() {
        $('#sidebarCollapse').show();
        $('#uploadobs').show();
    },
    onOffline: function() {
        $('#sidebarCollapse').show();
        $('#uploadobs').hide();
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
                var id_aoi = window.sessionStorage.getItem("id_aoi");
                tx.executeSql('SELECT * FROM surveydata where id_aoi = ' + id_aoi + ' and uploaded = 0;', [], function (tx, res) {       
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
                                + '", "tree_species":"'      + obs.id_tree_species
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
                        db.transaction(function (tx) {
                            var id_aoi = window.sessionStorage.getItem("id_aoi");
                            tx.executeSql('UPDATE surveydata SET uploaded = 1 where id = ' + obs.id + ';', [], function (tx, res) {       
                                resolve({id:r.key, lid:obs.id});
                            },
                            function (tx, error) {
                                console.log('EXEC SQL : UPDATE surveydata error: ' + error);
                                reject(error);   
                            });  
                        },
                        function (tx, error) {
                            console.log('TRANSAC : UPDATE surveydata  error: ' + error);
                            reject(error);   
                        });                                                  
                        
                    },
                    error: function(req, status, error) {                        
                        reject(error);                        
                    }
                });
            })
        };

        var sendPhotoforObs = function(obs) {
            return new Promise(function(resolve, reject) {
                db.transaction(function (tx) {                
                    tx.executeSql('SELECT * FROM photo where id_surveydata = ' + obs.lid + ';', [], function (tx, res) {
                        if (res.rows.length == 0) {resolve(res);}
                        // TODO : make this loop synchronous?
                        for(var x = 0; x < res.rows.length; x++) {
                            var photo = {};
                            photo.id_surveydata     = res.rows.item(x).id_surveydata;
                            photo.compass           = res.rows.item(x).compass;
                            photo.image             = res.rows.item(x).image;
                            photo.comment             = res.rows.item(x).comment;

                            var data = '{"survey_data" :"'  + obs.id
                                    + '", "compass":"'      + photo.compass
                                    + '", "image":"'        + photo.image
                                    + '", "comment":"'      + photo.comment
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
                        reject(error.message);
                    });
                });
            });
        } 
       
        /*
        function delay() {
            return new Promise(resolve => setTimeout(resolve, 300));
        }
        
        async function delayedLog(item) {
        // notice that we can await a function
        // that returns a promise
        await delay();
        console.log(item);
        }
        */

        new Promise(getObservations)        
        .then((observations) => {
            console.log("sending observations ... ");  
            console.log(observations);
            /*async function processArray(array) {
                for (const item of array) {
                    await delayedLog(item);
                }
                console.log('Done!');
            }*/
            // return processArray(array)
            if (observations.length > 0) {
                var sendObs = observations.map(obs => sendObservation(obs));
                return Promise.all(sendObs);
            } else {
                return Promise.reject("no observation to be sent");
            }                            
        }, (value) => {handleError(value);})        
        .then((serverids) => {
            console.log("sending photos ... ");
            console.log(serverids);          
            var sendPhotos = serverids.map(serverid => sendPhotoforObs(serverid));
            return Promise.all(sendPhotos);
        }, (value) => {handleError(value);})         
        .then(() => {
            console.log("Photos sent");
            displayMessage("Remote database updated.",()=>{});                          
        }, (value) => {
            displayMessage("Error - It was not possible to send Photos.",()=>{});
            handleError(value);
        })
        .catch(function(error) {
            console.log(error);            
        })
        .finally(function() { 
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            console.log("finally");
            window.plugins.spinnerDialog.hide();
            displayMessage("observations uploaded.",()=>{});       
            window.location = "obs_list.html";
        });
    },

    // Update DOM on a Received Event
    deleteOBS: function(id_aoi) {

        var handleError = function(error_message) {
            console.log("value promise : " + error_message);
            // display message error_message
            return Promise.reject(error_message);      
        };

        runSQL2('DELETE FROM photo where id_surveydata in (select id from surveydata where id_aoi = ' + id_aoi + ' and uploaded = 1);')
        .then(() => {
            console.log("Photos deleted ... ");console.log("deleting obs ... ");             
            return runSQL2('DELETE FROM surveydata where id_aoi = ' + id_aoi + ' and uploaded = 1;');
        }, (value) => {
            displayMessage("Error - It was not possible to delete photos.",()=>{});
            handleError(value);
        })
        .then(() => {console.log("observations deleted ... ")}, (value) => {
            displayMessage("Error - It was not possible to delete observations.",()=>{});
            handleError(value);
        })
        .catch(function(error) {
            console.log(error);            
        })
        .finally(function() { 
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            console.log("finally");
            window.plugins.spinnerDialog.hide();
            displayMessage("observations deleted.",()=>{});       
            window.location = "obs_list.html";
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

/* function edit_obs(id_obs) {
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
                window.sessionStorage.setItem("obs_uploaded",           res.rows.item(0).uploaded);
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
} */

function edit_obs(id_obs) {
    var err = false;
    var uploaded;
    
    runSQL2('DELETE FROM photo where id_surveydata is NULL;')
    .then(() => {    
        console.log("photos deleted ... ");    
        return runSQL2('SELECT * FROM surveydata where id = '+id_obs+';');
    }, (value) => {
        displayMessage("Error - It was not possible to delete photo.",()=>{});
        handleError(value);
    })
    .then((res) => {        
        window.sessionStorage.setItem("obs_id",                 res.rows.item(0).id);
        window.sessionStorage.setItem("obs_name",               res.rows.item(0).name);
        window.sessionStorage.setItem("obs_comment",            res.rows.item(0).comment);
        window.sessionStorage.setItem("obs_id_tree_species",    res.rows.item(0).id_tree_species);
        window.sessionStorage.setItem("obs_id_crown_diameter",  res.rows.item(0).id_crown_diameter);
        window.sessionStorage.setItem("obs_id_canopy_status",   res.rows.item(0).id_canopy_status);
        window.sessionStorage.setItem("obs_latitude",           res.rows.item(0).latitude);
        window.sessionStorage.setItem("obs_longitude",          res.rows.item(0).longitude);
        window.sessionStorage.setItem("obs_uploaded",           res.rows.item(0).uploaded);
        uploaded = res.rows.item(0).uploaded;
    }, (value) => {
        displayMessage("Error - It was not possible to select obs.",()=>{});
        handleError(value);
    })
    .catch(function(error) {
        err = true;
        console.log("error - edit obs");
        console.log(error);            
    })
    .finally(function() {        
        console.log("finally - edit obs");
        window.plugins.spinnerDialog.hide();      
        if (!err) {
            if (uploaded === "1") {window.location = "obs_form.html"}
            else                  {window.location = "obs_map.html"}        
        };
    });
    
}

function delete_obs(id_obs) {
    window.plugins.spinnerDialog.show("deleting observation ...");
    var handleError = function(error_message) {
        console.log("value promise : " + error_message);
        // display message error_message
        return Promise.reject(error_message);      
    };
    runSQL2("DELETE FROM surveydata WHERE id = " + id_obs + ";")
    .then(() => {
        console.log("observation deleted ... ");console.log("deleting obs ... ");             
        return runSQL2("DELETE FROM photo WHERE id_surveydata = " + id_obs + ";");
    }, (value) => {
        displayMessage("Error - It was not possible to delete surveydata.",()=>{});
        handleError(value);
    })
    .then(() => {console.log("photos deleted ... ")}, (value) => {
        displayMessage("Error - It was not possible to delete photos.",()=>{});
        handleError(value);
    })
    .catch(function(error) {
        console.log(error);            
    })
    .finally(function() {        
        console.log("finally - delete obs");
        window.plugins.spinnerDialog.hide();      
        window.location = "obs_list.html";
    });
}

$("#addOBS").click(function(e) {
    e.preventDefault();
    window.plugins.spinnerDialog.show();
    var err = false;
    runSQL2('DELETE FROM photo where id_surveydata is NULL;')
    .then((res) => {        
        window.sessionStorage.setItem("obs_id", "");
        window.sessionStorage.setItem("obs_uploaded", "0");
        window.sessionStorage.setItem("obs_name", "myobstest");
        window.sessionStorage.setItem("obs_latitude", "39.784352364601");
        window.sessionStorage.setItem("obs_longitude", "-7.6377547801287"); 
    }, (value) => {
        displayMessage("Error - It was not possible to delete photos.",()=>{});
        handleError(value);
    })
    .catch(function(error) {
        err = true;
        console.log("error - add obs");
        console.log(error);            
    })
    .finally(function() {        
        console.log("finally - add obs");
        window.plugins.spinnerDialog.hide();      
        if (!err) {window.location = "obs_map.html"};
    });
    return false;
});