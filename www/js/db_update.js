function update() {
    update_regions();
    update_treespecies();
    update_crowndiameter();
    update_canopystatus();       
}

function synchronize() {
    sync_AOIandObservations();
    sync_Images();
}

function update_regions() {
    var token = window.sessionStorage.getItem("token");
    $.ajax({
        type : 'GET',
        crossDomain : true,
        url : SERVERURL + '/api/gzs/',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
        success : function(reg) {
            $.each(reg, function(key, val) {
                db.transaction(function(tx) {
                    var sqlstr = "REPLACE INTO geographicalzone("
                    + "id, name, layer_name, wms_url, proj, image_url, x_min, x_max, y_min, y_max) "
                    + "VALUES("+val.key+",'"+val.name+"','layer_name','wms_url','proj'"+",'"+val.image_url
                    + "',"+val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+")";

                    tx.executeSql(sqlstr);                            
                }, function(error) {
                    if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
                        $("#errorpopupdata>p").html("");
                    }
                    $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - It was not possible to update the DB.</p>");
                    $('#errorpopup').modal('show');
                }, function() {
                    if(document.getElementById("successpopupdata").getElementsByTagName('p').length > 0) {
                        $("#successpopupdata>p").html("");
                    }
                    $("#successpopupdata").prepend("<p><i class='fas fa-smile'></i> Database updated.</p>");
                    $('#successpopup').modal('show');
                });
            });
            loadRegions();
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
            window.plugins.spinnerDialog.hide();
        },
        error : function(req, status, error) {
            window.plugins.spinnerDialog.hide();
            if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
                $("#errorpopupdata>p").html("");
            }
            $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - No connection to the DB.</p>");
            $('#errorpopup').modal('show');
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
        }
    });
}

function update_treespecies() {
  var token = window.sessionStorage.getItem("token");
  $.ajax({
    type : 'GET',
    crossDomain : true,
    url : SERVERURL + '/api/species/',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
    success : function(reg) {
      $.each(reg, function(key, val) {
          db.transaction(function(tx) {                    
              var sqlstr = "INSERT INTO treespecies(id, name) VALUES("+val.key+",'"+val.name+"')";
              tx.executeSql(sqlstr);                            
          }, function(error) {
              console.log('Transaction ERROR: ' + error.message);
          }, function() {
              console.log('Populated table species OK');
          });
      });
    },
    error : function(req, status, error) {
        console.log("no connection to DB");
    }
  });
}

function update_crowndiameter() {
  var token = window.sessionStorage.getItem("token");
  $.ajax({
    type : 'GET',
    crossDomain : true,
    url : SERVERURL + '/api/crowns/',
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
    success : function(reg) {
      $.each(reg, function(key, val) {
          db.transaction(function(tx) {                    
              var sqlstr = "INSERT INTO crowndiameter(id, name) VALUES("+val.key+",'"+val.name+"')";
              tx.executeSql(sqlstr);                            
          }, function(error) {
              console.log('Transaction ERROR: ' + error.message);
          }, function() {
              console.log('Populated table crowndiameter OK');
          });
      });
    },
    error : function(req, status, error) {
        console.log("no connection to DB");
    }
  });
}

function update_canopystatus() {
    var token = window.sessionStorage.getItem("token");
    $.ajax({
      type : 'GET',
      crossDomain : true,
      url : SERVERURL + '/api/canopies/',
      beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
      success : function(reg) {
        $.each(reg, function(key, val) {
            db.transaction(function(tx) {
                var sqlstr = "INSERT INTO canopystatus(id, name) VALUES("+val.key+",'"+val.name+"')";
                tx.executeSql(sqlstr);
            }, function(error) {
                console.log('Transaction ERROR: ' + error.message);
            }, function() {
                console.log('Populated table canopystatus OK');
            });
        });
      },
      error : function(req, status, error) {
          console.log("no connection to DB");
      }
    });
}

