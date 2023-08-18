var listObs = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);        
    },
    onDeviceReady: function() {
        
        window.screen.orientation.unlock();

        document.addEventListener("backbutton", onBackKeyDown, false);

        clearWSitems_obs();        
        
        var id_aoi = window.sessionStorage.getItem("id_aoi");        

        db.transaction(function (tx) {
                //var query = 'SELECT * FROM surveydata where id_aoi = '+id_aoi+';';
                var query = "SELECT " +
                            "surveydata.id AS id, " +
                            "surveydata.name AS name, " +
                            "surveydata.uploaded AS surveydata_uploaded, " +
                            "photo.id AS photo_id, " +
                            "photo.uploaded AS photo_uploaded " +
                            "FROM " +
                            "surveydata " +
                            "LEFT OUTER JOIN photo ON surveydata.id = photo.id_surveydata " +
                            "WHERE surveydata.id_aoi = "+id_aoi+";";
              
                tx.executeSql(query, [], function (tx, res) {
                    var html = '<ul class="list-group">';
                    var a_obs = [];
                
                    for (var x = 0; x < res.rows.length; x++) {
                        var id_obs = res.rows.item(x).id;
                
                        // Check if the observation already exists in the array
                        var existingObs = a_obs.find(obs => obs.id === id_obs);
                        if (existingObs) {
                            // Observation already exists, update the uploaded field if necessary
                            if (res.rows.item(x).photo_uploaded == 2) {
                                existingObs.uploaded = 2;
                            }
                        } else {
                            // Observation doesn't exist, create a new entry
                            var obs = {};
                            obs.id = id_obs;
                            obs.name = res.rows.item(x).name;
                            obs.uploaded = res.rows.item(x).photo_uploaded == 2 ? 2 : res.rows.item(x).surveydata_uploaded;
                            a_obs.push(obs);
                        }
                    }

                    for (var x = 0; x < a_obs.length; x++) {
                        var id_obs = a_obs[x].id;

                        html += '<li class="list-group-item d-flex align-items-center py-1">' +
                            '<div class="mr-auto p-1"><h5>' + a_obs[x].name + '</h5></div>';

                        if (a_obs[x].uploaded == 1) {
                            html += '<div class="p-1"><i class="fas fa-clipboard-check fa-2x green"></i></div>'
                                    + '<div class="p-1"><a id="edit_idobs_'+id_obs+'" class="btn button button-listitem">'
                                    + '<i class="fas fa-eye fa-2x white"></i></a></div>'
                        } else if (a_obs[x].uploaded == 2) {
                            html += '<div class="p-1"><a id="warn_idobs_' + id_obs + '" class="btn button button-listitem">'
                                + '<i class="fas fa-circle-exclamation fa-2x green"></i></div>'
                                + '<div class="p-1"><a id="edit_idobs_'+id_obs+'" class="btn button button-listitem">'
                                + '<i class="fas fa-eye fa-2x white"></i></a></div>'
                        } else {
                            html += '<div class="p-1"><a id="edit_idobs_'+id_obs+'" class="btn button button-listitem">'
                                    + '<i class="fas fa-edit fa-2x white"></i></a></div>'
                        } 

                        html += '<div class="p-1"><a id="dele_idobs_' + id_obs + '" data-uploaded="' + a_obs[x].uploaded + '" class="btn button button-listitem">' +
                            '<i class="fas fa-trash fa-2x white"></i></a></div>' +
                            '</li>';
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
                    $("[id^=warn_idobs_]").click(function(e) {
                        e.preventDefault();                        
                        var id_obs = this.id.substring(11);
                        runSQL2("SELECT " +  
                        "surveydata.id AS id, " +
                        "surveydata.name AS name, " +
                        "surveydata.uploaded AS surveydata_uploaded, " +
                        "surveydata.response AS surveydata_response, " +
                        "photo.id AS photo_id, " +
                        "photo.uploaded AS photo_uploaded, " +  
                        "photo.response AS photo_response " +
                        "FROM surveydata " +
                        "LEFT JOIN photo ON surveydata.id = photo.id_surveydata " +
                        "WHERE surveydata.id_aoi = "+id_aoi+" and surveydata.id = " + id_obs + ";")
                        .then(
                            (res) => {
                                let resultString = '';

                                // Display field names on the first line
                                const fieldNames = Object.keys(res.rows.item(0));
                                resultString += fieldNames.join(', ') + '<br>';

                                // Display field values for each record
                                for (let x = 0; x < res.rows.length; x++) {
                                    const record = res.rows.item(x);
                                    const values = Object.values(record);
                                    resultString += values.join(', ') + '<br>';
                                }
                                // if surv.uploaded==2 then 1 break; 
                                // else photo.uploaded==2 then 2 break;
                                // write a short report either line:
                                //  - observation could not be uploaded
                                //  - 'one of the images could not be uploaded. response from the server was: response

                                resultString = "Some data for this observation could not be uploaded, please try uploading again.<br>" + resultString;
                            
                                displayMessage(resultString, () => {});
                                return false;
                            },
                            (error) => {
                                displayMessage("Error: " + error, () => {});
                            }
                        );  
                        
                    });
                    $("[id^=dele_idobs_]").click(function(e) {
                        e.preventDefault(); 
                        var id_obs = this.id.substring(11);  
                        if (this.dataset.uploaded=="0") { 
                            displayMessage("This observation has not been uploaded yet. Are you sure you want to delete it?",
                                            ()=>{delete_obs(id_obs);},
                                            ()=>{});
                            return false;
                        } else if (this.dataset.uploaded=="2") {  
                            displayMessage("This observation was not uploaded successfully. Are you sure you want to delete it?",
                                            ()=>{delete_obs(id_obs);},
                                            ()=>{});
                            return false;
                        }
                        else {
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
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');                   
            listObs.syncObservations();
            return false;
        });

        $('#uploadDataFile').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            //window.plugins.spinnerDialog.show(null, "deleting survey data ...");          
            listObs.uploadDataFile();            
            return false;
        });

        $('#exportDataFile').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            //window.plugins.spinnerDialog.show(null, "deleting survey data ...");          
            listObs.exportDataFile();            
            return false;
        });
        
        $('#deleteObs').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            window.plugins.spinnerDialog.show(null, "deleting survey data ...");
            var id_aoi = window.sessionStorage.getItem("id_aoi");
            listObs.deleteOBS(id_aoi);            
            return false;
        });
        $('#viewStatus').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            var id_aoi = window.sessionStorage.getItem("id_aoi");

            runSQL2("SELECT " +  
                    "surveydata.id AS id, " +
                    "surveydata.name AS name, " +
                    "surveydata.uploaded AS surveydata_uploaded, " +
                    "surveydata.response AS surveydata_response, " +
                    "photo.id AS photo_id, " +
                    "photo.uploaded AS photo_uploaded, " +  
                    "photo.response AS photo_response " +
                    "FROM surveydata " +
                    "LEFT JOIN photo ON surveydata.id = photo.id_surveydata " +
                    "WHERE surveydata.id_aoi = "+id_aoi+";")
                    .then(
                        (res) => {
                            let resultString = '';

                            // Display field names on the first line
                            const fieldNames = Object.keys(res.rows.item(0));
                            resultString += fieldNames.join(', ') + '<br>';

                            // Display field values for each record
                            for (let x = 0; x < res.rows.length; x++) {
                                const record = res.rows.item(x);
                                const values = Object.values(record);
                                resultString += values.join(', ') + '<br>';
                            }
                            displayMessage(resultString, () => {});
                            return false;
                        },
                        (error) => {
                            displayMessage("Error: " + error, () => {});
                        }
                    );    
        });

    },
    onOnline: function() {
        if (window.sessionStorage.getItem("stayOffline") === "true") {
            stayOffline();
        } else {
            $('#sidebarCollapse').show();
            $('#uploadobs').show();
        }
    },
    onOffline: function() {
        stayOffline();
    },
    uploadDataFile: function() { 
        const shareFile = function(fileURL) {            
            window.plugins.socialsharing.share(null, null, fileURL, null);
        }
        getObservations()   
        .then((observations) => {
            const geojson = createGeoJSON(observations)
            saveGeoJSONToFile(geojson, function (fileURL) {
                shareFile(fileURL);
            });                        
        })        
    },  
    exportDataFile: function() {   
        function onSuccess(entry) {
            displayMessage("File copied successfully to: " + entry.fullPath,()=>{});
        }
        
        function onError(error) {
            displayMessage("Error copying file: " + error.code + " - " + error.message,()=>{});
        }
        
        getObservations()   
        .then((observations) => {
            const geojson = createGeoJSON(observations)
            saveGeoJSONToFile(geojson, function (fileURL) { 
                copyFile(fileURL, "Download", onSuccess, onError);
            });                        
        })

    },
    syncObservations: function() {        

        var token = window.sessionStorage.getItem("token");  

        var handleError = function(error) {
            var message;
            console.error('error: ', error) 
            if (error == '401') { message = 'Your session has expired. Please log in again'}
            else                { message = error }  
            console.log(message)
        };
        
        var sendPhoto = function(obs, photo) {
            return new Promise(function(resolve,reject){
                var data = {
                    "survey_data": obs.id_server,
                    "compass": photo.compass,
                    "image": photo.image,
                    "comment": photo.comment
                };
                
                $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    url: window.sessionStorage.getItem("serverurl") + '/api/images/',
                    headers: {
                        "Authorization": "JWT " + token,
                        "Content-Type": "application/json"
                        //"cache-control": "no-cache"
                    },
                    processData: false,
                    data: JSON.stringify(data),
                    success: function(res) {
                        let response = res.status + ' ' + res.responseText;
                        let response_db = escapeSQLiteString(response);                       
                        console.log('SUCCESS: Ajax SendPhoto: for obs ' + obs.id + ' and photo ' + photo.id + ' error: ' + response);
                        let sqlstring = 'UPDATE photo SET uploaded = 1, response = "OK"   where id = ' + photo.id;
                        resolve(sqlstring)
                        
                    },
                    error: function(res, status, error) {  
                        let error_message = error + ' ' + res.status + ' ' + res.responseText;
                        let error_message_db = escapeSQLiteString(error_message); 
                        console.log('ERROR: Ajax SendPhoto: for obs ' + obs.id + ' and photo ' + photo.id + ' error: ' + error_message);
                        let sqlstring = 'UPDATE photo SET uploaded = 2, response = "'+ error_message_db +'" where id = ' + photo.id + ';'
                        resolve(sqlstring)                                
                    }
                });
            
            }).then((sqlstring) => {            
                 return runSQL2(sqlstring);

            }).catch(function(error) {  
                console.error("Error occurred while sending photo:", error);                                                           
                return Promise.reject(error);
            });                
        }

        var sendPhotosforObs = function(obs) {
            // First, check if related survey data exists in the database and if it was uploaded successfully
            return runSQL2('SELECT * FROM surveydata where id = ' + obs.id + ' ;')
                .then((res) => {
                    console.log(res);
                    if (res.rows.length === 0) {
                        return Promise.resolve('no survey data');
                    } else if (res.rows.item(0).uploaded !== 1) {
                        return Promise.resolve('survey not uploaded');
                    } else {
                        return runSQL2('SELECT * FROM photo where id_surveydata = ' + obs.id + ' and uploaded IN (0,2);');
                    }
                })
                .then((res) => {
                    if (typeof res === 'string') {
                        console.log(res);
                        return Promise.resolve(res);

                    } else {                      
                        if (res.rows.length === 0) {
                            return res;
                        } else {
                            let promiseChain = Promise.resolve();
        
                            for (let x = 0; x < res.rows.length; x++) {
                                const photo = {
                                    id_surveydata: res.rows.item(x).id_surveydata,
                                    compass: res.rows.item(x).compass,
                                    image: res.rows.item(x).image,
                                    comment: res.rows.item(x).comment,
                                    id: res.rows.item(x).id,
                                };
                                promiseChain = promiseChain.then(() => sendPhoto(obs, photo))
                                .catch(function(error) {
                                    console.error('error in function sendPhoto: ', error);
                                    return Promise.reject(error);
                                });
                            }
                            return promiseChain;
                        }
                    }
                })
                .then((res) => {
                    console.log('out of promisechain: obs' + obs.id);
                    return res;
                })
                .catch(function(error) {
                    console.error('error in function sendPhotosforObs: ', error);
                    return Promise.reject(error);
                });
        };        

        var sendObservation = function (obs) {            
            return new Promise(function(resolve, reject) {

                if (obs.uploaded == 1) {
                    resolve({id_server:obs.id_server, id:obs.id, msg:'skipupdatelocaldb'});

                } else {

                    var data = {
                        "name": obs.name,
                        "tree_species": obs.id_tree_species,
                        "crown_diameter": obs.id_crown_diameter,
                        "canopy_status": obs.id_canopy_status,
                        "comment": obs.comment,
                        "latitude": obs.latitude,
                        "longitude": obs.longitude
                    };
                                    
                    $.ajax({
                        type: 'POST',
                        crossDomain: true,
                        url: window.sessionStorage.getItem("serverurl") + '/api/aois/' + obs.id_aoi + '/observations/',
                        headers: {
                            "Authorization": "JWT " + token,
                            "Content-Type": "application/json"
                            //"cache-control": "no-cache"
                        },
                        processData: false,
                        data: JSON.stringify(data),
                        success: r => {  
                            console.log('success Ajax Sendobs: ');    
                            console.log('Response status:', r.status);
                            console.log('Response data:', r.data);
                   
                            let sqlstring = 'UPDATE surveydata SET uploaded = 1, id_server = ' + r.key + ', response = "OK" where id = ' + obs.id + ';'
                            resolve({id_server:r.key, id:obs.id, sql:sqlstring, msg:''});
                        },
                        error: function(req, status, error) {
                            var error_message = error + ' ' + req.status + ' ' + req.responseText;
                            var error_message_db = escapeSQLiteString(error_message);
                            console.log('error Ajax SendObs obs id: '+ obs.id + ' ' + error_message);
                            let sqlstring = 'UPDATE surveydata SET uploaded = 2, response = "'+ error_message_db + '" where id = ' + obs.id + ';'
                            resolve({id_server:null, id:obs.id, sql:sqlstring, msg:''}) 
                        }
                    });
                }
            }).then((value) => { 
                if (value.msg == '')           
                    return runSQL2(value.sql).then(() => {return Promise.resolve(value)})
                else {
                    return Promise.resolve(value)
                }

            }).then((value) => {            
                return sendPhotosforObs(value);

            }).then((value) => {            
                console.log('out of sendPhotosforObs')
                return Promise.resolve(value);

            }).catch(function(error) {    
                console.error('error in function sendObservation: ', error)                                                         
                return Promise.reject(error);
            });
        }; 
        
        var sendObservations = function () { 
            window.plugins.spinnerDialog.show(null, "uploading survey data ...");
            getObservations()   
            .then((observations) => {
                console.log("sending observations ... ");  
                console.log(observations);        
                if (observations.length > 0) {
                    var sendObs = observations.map(obs => sendObservation(obs));
                    return Promise.all(sendObs);
                } else {
                    return Promise.reject("no observation to be sent");
                }                            
            })
            .then((value) => {       
                // here check the local database to see if all data could be sent
                displayMessage("Process finished.",()=>{}); 
            
                window.plugins.spinnerDialog.hide();
            })
            .catch((error) => {        
                window.plugins.spinnerDialog.hide();
                handleError(error);
                //displayMessage("An error occured in the uploading process.",()=>{});               
                console.error('syncobs last catch - error: ', error)            
            })
            .finally(() => { 
                console.log("finally");
                window.plugins.spinnerDialog.hide();                
                window.location = "obs_list.html";
            });
        }

        const loginTime = sessionStorage.getItem('loginTime');
        if (loginTime) {
            if (getTokenAge()>30) {
                refreshToken()
                .then(() => {sendObservations();})
                .catch(() => {displayMessage("Your token has expired, please log in again",
                                            ()=>{window.location = "login.html";},
                                            ()=>{})});                
            } else {
                sendObservations();
            }
        } else {
            window.location = "login.html";
        }
    
    },

    deleteOBS: function(id_aoi) {

        var handleError = function(error_message) {
            console.log("value promise : " + error_message);
            // display message error_message
            return Promise.reject(error_message);      
        };

        runSQL2('DELETE FROM photo where uploaded = 1 and id_surveydata in (select id from surveydata where id_aoi = ' + id_aoi + ' and uploaded = 1);')
        .then(() => {
            console.log("Photos deleted ... ");        
            return runSQL2('DELETE FROM surveydata where id_aoi = ' + id_aoi + ' and uploaded = 1;');
        }, (value) => {
            displayMessage("Error - It was not possible to delete photos.",()=>{});
            handleError(value);
        })     
        .catch(function(error) {
            displayMessage("Error - It was not possible to delete observations.",()=>{});
            console.log(error);            
        })
        .finally(function() { 
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

function stayOffline() {
    $('#sidebarCollapse').show();
    $('#uploadobs').hide();
}

function onBackKeyDown() {
    window.location = "aoi_list.html";
}

function edit_obs(id_obs) {
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
    }).then((res) => { 
        if (uploaded === "1") {window.location = "obs_form.html"}
        else                  {window.location = "obs_map.html"} 
    })
    .catch(function(error) {
        err = true;
        console.log("error - edit obs");
        console.log(error);            
    })
    .finally(function() {        
        console.log("finally - edit obs");
        window.plugins.spinnerDialog.hide();
    });
    
}

function delete_obs(id_obs) {
    window.plugins.spinnerDialog.show("deleting observation ...");

    runSQL2("DELETE FROM surveydata WHERE id = " + id_obs + ";")
        .then(() => {
            console.log("observation deleted ... ");
            console.log("deleting obs ... ");
            return runSQL2("DELETE FROM photo WHERE id_surveydata = " + id_obs + ";");
        })
        .then(() => {
            console.log("photos deleted ... ");
            window.plugins.spinnerDialog.hide();
            window.location = "obs_list.html";
        })
        .catch((error) => {
            console.log("Error occurred while deleting observation:", error);
            displayMessage("An error occurred while deleting the observation.", () => {});
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
        /* window.sessionStorage.setItem("obs_name", "myobstest");
        window.sessionStorage.setItem("obs_latitude", "39.784352364601");
        window.sessionStorage.setItem("obs_longitude", "-7.6377547801287");  */
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

function getObservations() {
    const id_aoi = window.sessionStorage.getItem("id_aoi");
    return runSQL2('SELECT * FROM surveydata where id_aoi = ' + id_aoi + ';')  
        .then(getResArray)
        .catch((error) => {
            console.error("Error occurred while fetching survey data:", error);
            return Promise.reject(error);
        });
};

function createGeoJSON(data) {
    const geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (let item of data) {
        const feature = {
            type: 'Feature',
            properties: {
                id: item.id,
                id_server: item.id_server,
                name: item.name,
                id_tree_species: item.id_tree_species,
                id_crown_diameter: item.id_crown_diameter,
                id_canopy_status: item.id_canopy_status,
                comment: item.comment,
                id_aoi: item.id_aoi,
                uploaded: item.uploaded,
                response: item.response
            },
            geometry: {
                type: 'Point',
                coordinates: [item.longitude, item.latitude]
            }
        };
        geojson.features.push(feature);
    }

    return geojson;
}

