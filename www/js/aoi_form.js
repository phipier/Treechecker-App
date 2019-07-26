var aoiform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        AOI_cancel = false;
        $("#cancelaoi").hide();
        document.addEventListener("backbutton", onBackKeyDown, false);
        window.plugins.spinnerDialog.show();
        var id_aoi = window.sessionStorage.getItem("id_aoi");
                 
        $("#InputAOIname").val(window.sessionStorage.getItem("aoiname"));
        $("#Inputxmin").val(window.sessionStorage.getItem("bbox_xmin")); 
        $("#Inputxmax").val(window.sessionStorage.getItem("bbox_xmax"));
        $("#Inputymin").val(window.sessionStorage.getItem("bbox_ymin")); 
        $("#Inputymax").val(window.sessionStorage.getItem("bbox_ymax"));
        
        window.plugins.spinnerDialog.hide();        
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

aoiform.initialize();

$("#saveaoi").click( function(e) {
    e.preventDefault();
    if (!tile_downloading) {
        if ($("#AOI-form")[0].checkValidity() === false) {
            $("#AOI-form")[0].classList.add('was-validated');
            return false;
        } else {
            $("#AOI-form")[0].classList.add('was-validated');
        }
        var id_aoi = window.sessionStorage.getItem("id_aoi");

        var aoiname = $("#InputAOIname").val();
        var bbox = { xmin : Number($("#Inputxmin").val()),
                    xmax : Number($("#Inputxmax").val()),
                    ymin : Number($("#Inputymin").val()),
                    ymax : Number($("#Inputymax").val()) }
        
        // check bbox value (not too large)

        add_AOI(aoiname, bbox);
    }
    return false; 
} );

$("#cancelaoi").click( function(e) {
    e.preventDefault();
    cancel_AOI()
    return false;
});

function onBackKeyDown() {
    cancel_AOI()
    window.location = "aoi_list.html";   
}

function cancel_AOI() {    
    if (tile_downloading) {
        startCancelSpinner();
        AOI_cancel = true;
    } 
}

function exit_AOI(success, message) {
    stopButtonSpinners();    
    if (success) { 
        displayMessage("AOI created.", ()=>{            
                        clearWSitems();           
                        window.location = 'aoi_list.html';
                    }); 
    } else {
        displayMessage(message, ()=>{            
                        var id_aoi = window.sessionStorage.getItem("id_aoi");
                        if (id_aoi) { delete_aoi_fromDB(id_aoi); }
                    });
    }    
}

$("#selectarea").click( function(e) {
    e.preventDefault();
    window.sessionStorage.setItem("aoiname",$("#InputAOIname").val());
    window.sessionStorage.setItem("bbox_xmin", $("#Inputxmin").val()); 
    window.sessionStorage.setItem("bbox_xmax", $("#Inputxmax").val()); 
    window.sessionStorage.setItem("bbox_ymin", $("#Inputymin").val()); 
    window.sessionStorage.setItem("bbox_ymax", $("#Inputymax").val());
    window.location = 'aoi_map.html'; 
    return false;
});

function add_AOI(aoiname, bbox) {    
    AOI_cancel = false;
    tile_downloading = true;
    startSaveSpinner();

    var token = window.sessionStorage.getItem("token");
    var id_region = window.sessionStorage.getItem("id_region");

    aoi_data =  '{"name" :"' + aoiname 
            + '", "x_min":"' + bbox.xmin 
            + '", "x_max":"' + bbox.xmax 
            + '", "y_min":"' + bbox.ymin 
            + '", "y_max":"' + bbox.ymax + '"}';

    var urlaoi = SERVERURL + "/api/gzs/"+ id_region +"/aois/";

    $.ajax({
        async: true,
        crossDomain: true,
        url: urlaoi,
        method: "POST",
        headers: {
        "Authorization": "JWT " + token,
        "Content-Type": "application/json",
        "cache-control": "no-cache"         
        },
        processData: false,
        data: aoi_data,
        success : function(val) { 
            window.sessionStorage.setItem("id_aoi",val.key);             
            insert_AOI(val, bbox, id_region);
        },
        error : function(req, status, error) {
            if ($.parseJSON(req.responseText).detail == "Signature has expired.") {
                $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    dataType: 'text',
                    url: SERVERURL + '/api-token-auth/',
                    data: {
                        email: window.sessionStorage.getItem("email"),
                        password: window.sessionStorage.getItem("password")
                    },
                    contentType: 'application/x-www-form-urlencoded',
                    success: function(r) {
                        window.sessionStorage.setItem("token", $.parseJSON(r).token);
                        displayMessage("Error - Please try again to store the AOI.");
                        $('#ok_sent').click(function() {
                            window.location = 'aoi_form.html';
                        });
                    },
                    error: function(req, status, error) {
                        displayMessage("Error - It was not possible to add the AOI to the remote DB. Try again later or check if there is internet connection.<br>" + req.responseText);
                    }
                })
            } else {
                displayMessage("Error - It was not possible to add the AOI to the remote DB. <br> " + req.responseText);
            }
        }
    });    
}

function delete_aoi_fromDB(id_aoi) {
    window.plugins.spinnerDialog.show("Deleting AOI ...");
    runSQL2('DELETE FROM aoi WHERE id = ' + id_aoi + ';')
    .then((res) => { console.log("AOI deleted"); },   (error) => {handleError(error);})         
    .catch(function(value) {console.log(value);})
    .finally(function() {
        // delete downloaded tiles on device
        deleteTiles(id_aoi);

        // deletes AOI on remote DB
        var token = window.sessionStorage.getItem("token");         
        $.ajax({
            method : 'DELETE',
            crossDomain : true,
            url : SERVERURL + '/api/aois/' + id_aoi,
            beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
            success : function(reg) {
                console.log("DELETE AOI success.")     
                init_progress();
                window.plugins.spinnerDialog.hide();   
            },
            error : function(req, status, error) {
                window.plugins.spinnerDialog.hide();
                console.log("could not delete AOI from remote server.");
            },
            complete : function(xhr,textStatus) {
                window.plugins.spinnerDialog.hide();
                console.log("DELETE AOI complete. " + textStatus);
            }
        }); 
    });
}

function insert_AOI(val, bbox, id_region) {
    db.transaction(function(tx) {
        var sqlstr = 
            "REPLACE INTO aoi(id, name, x_min, x_max, y_min, y_max, geographical_zone_id) "
            + "VALUES("+val.key+",'"+val.name+ "',"
            +           val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+ ","
            +           id_region+")";

        tx.executeSql(sqlstr, [], function (tx, res) {            
            downloadTiles(val.key, bbox);
        },
        function (tx, error) {
            console.log('REPLACE INTO aoi error: ' + error.message);
            exit_AOI(False, 'REPLACE INTO aoi error: ' + error)
        });      

    }, function(error) {       
        exit_AOI(False, "Error - It was not possible to add the AOI to the local DB")
    }, function() {
        console.log('Populated database OK');
    });
}

function clearWSitems() {
    window.sessionStorage.removeItem("aoiname");
    window.sessionStorage.removeItem("bbox_xmin");
    window.sessionStorage.removeItem("bbox_xmax");
    window.sessionStorage.removeItem("bbox_ymin");
    window.sessionStorage.removeItem("bbox_ymax");
}

function stopButtonSpinners() {
    //$("#saveaoi #loadingspinner").remove();
    //$("#cancelaoi #loadingspinner").remove();
    //$("#iconsave").attr( "class", "fas fa-check" );
    $("#iconsave").remove();
    $("#saveaoi").append('<i id="iconsave" class="fas fa-check"></i>');
    //$("#iconcancel").attr( "class", "fas fa-stop" );
    $("#iconcancel").remove();
    $("#cancelaoi").append('<i id="iconcancel" class="fas fa-stop red"></i>');

    $("#cancelaoi").hide();
}
function startCancelSpinner(){
    //stopButtonSpinners()
    //$("#cancelaoi").prepend('<span id="loadingspinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp');
    $("#cancelaoi").show();
    $("#iconcancel").remove();
    $("#cancelaoi").append('<i id="iconcancel" class="spinner-border red"></i>');    
    //$("#iconcancel").attr( "class", "spinner-border" );
}
function startSaveSpinner(){
    //stopButtonSpinners()
    //$("#saveaoi").prepend('<span id="loadingspinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp');
    $("#iconsave").remove();
    $("#saveaoi").append('<i id="iconsave" class="spinner-border white"></i>');
    $("#cancelaoi").show();
}