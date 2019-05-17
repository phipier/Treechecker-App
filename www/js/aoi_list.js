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
                        /*+ '<a id="edit_idaoi_'+id_aoi+'" class="btn button add_edit_delete_aoi">edit aoi</a>'*/
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
    },
    onOnline: function() {
        $('.add_edit_delete_aoi').show();

        $("#addAOI").click( function(e) {
            e.preventDefault();
            window.sessionStorage.setItem("id_aoi", "");
            window.sessionStorage.setItem("aoiname", "");

            window.sessionStorage.setItem("bbox_ymin", "39.784352364601");
            window.sessionStorage.setItem("bbox_ymax", "39.783579888405");
            window.sessionStorage.setItem("bbox_xmin", "-7.6377547801287");
            window.sessionStorage.setItem("bbox_xmax", "-7.63670469529");
 
            window.location = 'aoi_form.html';
            return false;
        });
    },
    onOffline: function() {
        $('.add_edit_delete_aoi').hide();
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

    if(document.getElementById("messagepopupdata").getElementsByTagName('p').length > 0) {
        $("#messagepopupdata>p").html("");
    }
    var message = "All observations of this AOI will be deleted. Do you want to proceed anyway?";
    $("#messagepopupdata").prepend("<p><i class='fas'></i> " + message + "</p>");
    $('#messagepopup').modal('show');   
    $("#ok_sent").click(function(){
        $("#messagepopup").modal("hide");
        delete_aoi_fromDB(id_aoi);        
    });
    $("#cancel_sent").click(function(){
        $("#messagepopup").modal("hide");
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

