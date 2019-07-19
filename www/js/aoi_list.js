var listAOI = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);
    },

    onDeviceReady: function() {
        document.addEventListener("backbutton", onBackKeyDown, false);
        
        window.plugins.spinnerDialog.show();
        var id_region = window.sessionStorage.getItem("id_region");

        db.transaction(function (tx) {
                var query = 'SELECT * FROM aoi where geographical_zone_id = '+id_region+';';
                tx.executeSql(query, [], function (tx, res) {

                    var html = '<ul class="list-group">';  
                    for(var x = 0; x < res.rows.length; x++) {
                        var id_aoi = res.rows.item(x).id;
                        html += '<li class="list-group-item">' 
                        + '<h5>' + res.rows.item(x).name + '</h5>'
                        + '<a id="data_idaoi_'+id_aoi+'" class="btn button button-navbar m-2"><i class="fas fa-clipboard-list fa-2x white"></i></a>'
                        /*+ '<a id="edit_idaoi_'+id_aoi+'" class="btn button edit_aoi">edit aoi</a>'*/
                        + '<a id="dele_idaoi_'+id_aoi+'" class="btn button button-navbar m-2"><i class="fas fa-trash fa-2x white"></i></a>'
                        + '</li>';
                    }    
                    html += "</ul>";

                    $("#listaoi-page").html(html);
                    $("[id^=data_idaoi_]").click(function(e) {
                        e.preventDefault(); 
                        var id_aoi = this.id.substring(11);
                        window.sessionStorage.setItem("id_aoi", id_aoi);
                        window.location = 'obs_list.html';
                        return false; 
                    });
                    /* TO DO later ... not a priority
                    $("[id^=edit_idaoi_]").click(function(e) {
                        e.preventDefault(); 
                        var id_aoi = this.id.substring(11);
                        window.sessionStorage.setItem("id_aoi", id_aoi);                    
                        window.location = 'aoi_form.html';
                        return false; 
                    });
                    */ 
                    $("[id^=dele_idaoi_]").click(function(e) {
                        e.preventDefault(); 
                        var id_aoi = this.id.substring(11);
                        window.sessionStorage.setItem("id_aoi", id_aoi);   
                        delete_aoi(id_aoi);                        
                        return false; 
                    });  
                    window.plugins.spinnerDialog.hide();
                },
                function (tx, error) {
                    console.log('SELECT AOI error: ' + error.message);
                    window.plugins.spinnerDialog.hide();
                });
            }, function (error) {
                console.log('transaction AOI error: ' + error.message);
                window.plugins.spinnerDialog.hide();
            }, function () {
                console.log('transaction AOI ok');  
                window.plugins.spinnerDialog.hide();              
            }
        );
        $("#addAOI").click( function(e) {
            e.preventDefault();
            window.sessionStorage.setItem("id_aoi", "");
            window.sessionStorage.setItem("aoiname", "");

            window.sessionStorage.removeItem("bbox_ymin");
            window.sessionStorage.removeItem("bbox_ymax");
            window.sessionStorage.removeItem("bbox_xmin");
            window.sessionStorage.removeItem("bbox_xmax");
 
            window.location = 'aoi_form.html';
            return false;
        });
    },
    onOnline: function() {          
        $('#addAOI').show();
        $('.edit_aoi').show();
    },
    onOffline: function() {
        $('#addAOI').hide();
        $('.edit_aoi').hide();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listAOI.initialize();

function onBackKeyDown() {
    window.location = "region_list.html";
}

function delete_aoi(id_aoi) {   
    displayMessage("All observations of this AOI will be deleted. Do you want to proceed anyway?",
        ()=>{ delete_aoi_fromDB(id_aoi); },
        ()=>{});
}

function delete_aoi_fromDB(id_aoi) {
    window.plugins.spinnerDialog.show("Deleting AOI ...");
    runSQL2('DELETE FROM photo where id_surveydata in (select id from surveydata where id_aoi = ' + id_aoi + ');')
    .then((res) => { return runSQL2('DELETE FROM surveydata where id_aoi = ' + id_aoi + ';'); }, (error) => {handleError(error);}) 
    .then((res) => { return runSQL2('DELETE FROM aoi WHERE id = ' + id_aoi + ';'); },            (error) => {handleError(error);}) 
    .then((res) => { console.log("AOI deleted"); },                                              (error) => {handleError(error);})         
    .catch(function(value) {console.log(value);})
    .finally(function() {       
        window.plugins.spinnerDialog.hide();  
        window.location = "aoi_list.html"     
    });
}

/*  TO DO later ... not a priority
function edit_aoi(id_aoi) {
    db.transaction(function (tx) {
            var query = 'SELECT * FROM aoi where id = '+id_aoi+';';
            tx.executeSql(query, [], function (tx, res) {  

                window.sessionStorage.setItem("id_aoi",    res.rows.item(0).id);
                window.sessionStorage.setItem("aoiname",   res.rows.item(0).name);
    
                window.sessionStorage.setItem("bbox_ymin", res.rows.item(0).ymin);
                window.sessionStorage.setItem("bbox_ymax", res.rows.item(0).ymax);
                window.sessionStorage.setItem("bbox_xmin", res.rows.item(0).xmin);
                window.sessionStorage.setItem("bbox_xmax", res.rows.item(0).xmax);               

                window.location = 'aoi_form.html';            
            },
            function (tx, error) {
                console.log('SELECT aoi error: ' + error.message);
            }); 
        }, function (error) {
            console.log('transaction aoi error: ' + error.message);
        }, function () {
            console.log('transaction aoi ok');
        }
    );
}
*/