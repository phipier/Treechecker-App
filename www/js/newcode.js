new Promise(getObservations)
  .then((observations) => {
    console.log("sending observations ... ");
    console.log(observations);

    if (observations.length > 0) {
      return sendObservationsSequentially(observations);
    } else {
      return Promise.reject("no observation to be sent");
    }
  })
  .then(() => {
    console.log("Photos sent");
    displayMessage("Remote database updated.", () => {});
  })
  .catch(function (error) {
    window.plugins.spinnerDialog.hide();
    console.log(error);
  })
  .finally(function () {
    $('#sidebar').toggleClass('active');
    $('.overlay').toggleClass('active');
    console.log("finally");
    window.plugins.spinnerDialog.hide();
    displayMessage("observations uploaded.", () => {});
    window.location = "obs_list.html";
  });


function sendObservationsSequentially(observations) {
    return observations.reduce((promiseChain, obs) => {
      return promiseChain.then(() => {
        return sendObservation(obs).then((serverid) => {
          // If sendObservation was successful, continue with sendPhotoforObs
          
          // TO DO: check if server id is valid (number), otherwise go to next ( Promise.resolve() )
          return sendPhotosSequentially(serverid);
        })
        .then(() => runSQLUpdate(obs)) 
        .catch((error) => {
          console.log('Error sending observation:', error);
          // Continue to the next observation without sending the pictures
          return Promise.resolve();
        });
      });
    }, Promise.resolve());
  }

  function sendObservationsSequentially(observations) {
    let promiseChain = Promise.resolve();
  
    for (const obs of observations) {
      promiseChain = promiseChain
        .then(() => sendObservation(obs))
        .then((serverid) => sendPhotosSequentially(serverid))
        .then(() => runSQLUpdate(obs))
        .catch((error) => {
          console.log('Error sending observation:', error);
        });
    }
  
    return promiseChain;
  }

  
  function sendPhotosSequentially(obs) {
    return new Promise(function(resolve, reject) {
        db.transaction(function(tx) {
            selectPhotosForObs(tx, obs)
                .then(function(photos) {
                    if (photos.length === 0) {
                        resolve(photos);
                    } else {
                        return photos.reduce(function(promiseChain, photo) {
                            return promiseChain.then(function() {
                                return sendPhoto(obs, photo);
                            }).catch(function(error) {
                                console.log('Error sending photo:', error);
                                // Continue to the next photo even if there was an error
                                return Promise.resolve();
                            });
                        }, Promise.resolve());
                    }
                })
                .then(function() {
                    resolve(); // Resolves the main promise after all photos are processed
                })
                .catch(function(error) {
                    reject(error); // Rejects the main promise if there's an error
                });
        });
    });
}
    
function sendPhotosSequentially2(obs) {
    return new Promise(function(resolve, reject) {       
        selectPhotosForObs(tx, obs)
        .then(function(photos) {
            if (photos.length === 0) {
                resolve(photos);
            } else {
                let promiseChain = Promise.resolve();  
                for (const photo of photos) {
                    promiseChain = promiseChain
                    .then(function() {
                        return sendPhoto(obs, photo);
                    })
                    .catch(function(error) {
                        console.log('Error sending photo:', error);
                        // Continue to the next photo even if there was an error
                        return Promise.resolve();
                    });
                }                    
                return promiseChain;
            }
        })
        .then(function() {
            resolve(); // Resolves the main promise after all photos are processed
        })
        .catch(function(error) {
            reject(error); // Rejects the main promise if there's an error
        });      
    });
}


function sendPhoto(obs, photo) {
    return new Promise(function(resolve, reject) {
        var data = {
            "survey_data": obs.id,
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
            },
            processData: false,
            data: JSON.stringify(data),
            success: function(res) {
                db.transaction(function(tx) {
                    tx.executeSql('UPDATE photo SET uploaded = 1, response = "' + res.status + ' ' + res.data + '"   where id = ' + photo.id + ';', [], function(tx, res) {
                        console.log('UPDATED photo for obs ' + obs.id + ' and photo ' + photo.id + ';');
                        resolve(res);
                    }, function(tx, error) {
                        console.log('EXEC SQL : UPDATE photo error: ' + error);
                        reject(error);
                    });
                }, function(error) {
                    console.log('TRANSAC : UPDATE photo  error: ' + error);
                    reject(error);
                });

                resolve(res);
            },
            error: function(req, status, error) {
                var error_message = error + ' ' + req.status + ' ' + req.responseText;
                var error_message_db = escapeSQLiteString(error_message);
                console.log('error Ajax SendPhoto: for obs ' + obs.lid + ' and photo ' + photo.id + ' error: ' + error_message);

                db.transaction(function(tx) {
                    tx.executeSql('UPDATE photo SET uploaded = 2, response = "' + error_message_db + '" where id = ' + photo.id + ';', [], function(tx, res) {
                        console.log('UPDATED photo for obs ' + obs.lid + ' and photo ' + photo.id + ';');
                        resolve();
                    }, function(tx, error) {
                        console.log('EXEC SQL : UPDATE photo error: ' + error);
                        reject(error);
                    });
                }, function(error) {
                    console.log('TRANSAC : UPDATE photo  error: ' + error);
                    reject(error);
                });
            }
        });
    });
}

function runSQLUpdate(obs) {
    return new Promise(function(resolve, reject) {
        db.transaction(function(tx) {
            tx.executeSql('UPDATE photo SET uploaded = 1 WHERE id_surveydata = ' + obs.lid + ';', [], function(tx, res) {
                console.log('UPDATED photos for obs ' + obs.id);
                resolve(res);
            }, function(tx, error) {
                console.log('EXEC SQL : UPDATE photo error: ' + error);
                reject(error);
            });
        }, function(error) {
            console.log('TRANSAC : UPDATE photo  error: ' + error);
            reject(error);
        });
    });
}

function selectPhotosForObs(tx, obs) {
    return new Promise(function(resolve, reject) {
        tx.executeSql('SELECT * FROM photo where id_surveydata = ' + obs.lid + ' ;', [], function(tx, res) {
            var photos = [];
            for (var x = 0; x < res.rows.length; x++) {
                photos.push({
                    id_surveydata: res.rows.item(x).id_surveydata,
                    compass: res.rows.item(x).compass,
                    image: res.rows.item(x).image,
                    comment: res.rows.item(x).comment,
                    id: res.rows.item(x).id
                });
            }
            resolve(photos);
        }, function(tx, error) {
            console.log('SELECT photo error: ' + error.message);
            reject(error.message);
        });
    });
}
