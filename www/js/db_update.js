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

function loadRegions() {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM geographicalzone';
        tx.executeSql(query, [], function (tx, res) {
            var html = "";
            for(var x = 0; x < res.rows.length; x++) {
                html += '<div class="card"><img id="img-card" class="card-img-top" src="img/'
                + res.rows.item(x).image_url
                + '" alt="Image"><div class="card-body"><h5 class="card-title">'
                + res.rows.item(x).name
                + '</h5><a id="idreg'+res.rows.item(x).id+'" href="#" class="btn button">Go</a></div></div>';
            }
            $("#listregions-page").html(html);
            $("[id^=idreg]").click(function(e) {
                e.preventDefault();
                var id_region = this.id.substring(5);
                window.sessionStorage.setItem("id_region", id_region);
                window.location = 'aoi_list.html';
                return false;
            });
            window.plugins.spinnerDialog.hide();
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
    }, function () {
        console.log('transaction ok');
    });
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

/*
Get tree species
URL	/api/species/
Method	GET
Requires authentication:	true
Params:	
Response:	[ { "key": 1, "name": "specie1" }, ... ]

Get crown diameters
URL	/api/crowns/
Method	GET
Requires authentication:	true
Params:	
Response:	[ { "key": 1, "name": "0.1" }, ... ]

Get canopy statuses
URL	/api/canopies/
Method	GET
Requires authentication:	true
Params:	
Response:	[ { "key": 1, "name": "status1" }, ... ]
*/

/*
INSERT INTO api_treespecie(name) VALUES('specie1'), ('specie2'), ('specie3');
INSERT INTO api_crowndiameter(name) VALUES('0.1'),('0.35'),('0.60'),('0.85'),
INSERT INTO api_canopystatus(name) VALUES('status1'),('status2'),('status3'),('status4'),('status5');
*/

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


function sync_AOIandObservations() {
    // AOI

        // SERVER actions
        // mark as "deleted" in server DB all AOI marked as "deleted" in local DB (+ delete records marked as "deleted" from local DB)
        // insert records into server DB from local DB where local id does not exist (new records)
        // updates all AOI records from server (in order to update local ids with server ids)

        // LOCAL actions
        // Delete in local DB all AOI marked as "deleted" in server DB
        // insert records from ServerDB where local id does not exist

    // Survey observations

        // SERVER actions
        // mark as "deleted" in server DB all OBS marked as "deleted" in local DB (+ delete records marked as "deleted" from local DB)
        // replace (update) OBS to server DB where id_local = id_server AND (server DB update date < locate DB update date) AND NOT deleted
        // insert records from ServerDB where local id does not exists

        // LOCAL actions
        // delete OBS in local DB marked as "deleted" in server DB
        // replace (update) all records in local DB from server DB where id_local = id_server AND (server DB update date > locate DB update date) and NOT deleted
        // insert records from ServerDB where local id does not exists
   
}

// observations 
    
/*
  Params:	{ "name": "obsTest", "tree_specie": 2, "crown_diameter": 2, "canopy_status": 5, "comment": "This is a test from postman", 
  "latitude": 1.72789, "longitude": 45.123456, "compass": 30.45 }

  Response:	{ "key": 5, "name": "obsTest", "tree_specie": { "key": 2, "name": "specie2" }, 
  "crown_diameter": { "key": 2, "name": "0.2" }, "canopy_status": { "key": 5, "name": "status5" }, 
  "comment": "This is a test from Postman", "position": { "longitude": 45.123456, "latitude": 1.72789 }, "images": [ ] }
*/

/*
obs_data =  '{"name" :"'            + $("#InputOBSname").text; 
+ '", "tree_specie":"'      + $("#InputSelectSpecies").children("option:selected").val()
+ '", "crown_diameter":"'   + $("#InputSelectCrown").children("option:selected").val()
+ '", "canopy_status":"'    + $("#InputSelectStatus").children("option:selected").val()
+ '", "comment":"'          + $("#InputOBScomment").text
+ '", "latitude":"'         + Number($("#Inputlatitude").text) 
+ '", "longitude":"'        + Number($("#Inputlongitude").text) 
+ '", "compass":"'        + Number($("#Inputcompass").text) 
+ '", "y_max":"' + bbox.ymax + '"}';
*/

function sync_Images() {}