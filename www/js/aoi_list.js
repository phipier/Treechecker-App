var listAOI = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);
    },

    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var id_region = window.sessionStorage.getItem("id_region");

        db.transaction(function (tx) {
                var query = 'SELECT * FROM aoi where geographical_zone_id = '+id_region+';';
                tx.executeSql(query, [], function (tx, res) {
                    var html = "";

                    for(var x = 0; x < res.rows.length; x++) {
                        var id_aoi = res.rows.item(x).id;
                        html += '<div class="card"><div class="card-body"><h5 class="card-title">' 
                        + res.rows.item(x).name + '</h5>'
                        + '<a id="data_idaoi_'+id_aoi+'" class="btn button">see survey data</a>'
                        + '<a id="edit_idaoi_'+id_aoi+'" class="btn button add_edit_delete_aoi">edit aoi</a>'
                        + '<a id="dele_idaoi_'+id_aoi+'" class="btn button add_edit_delete_aoi">delete aoi</a></div></div>';
                    }                    
                    $("#listaoi-page").html(html);
                    $("[id^=data_idaoi_]").click(function(e) {
                        e.preventDefault(); 
                        var id_aoi = this.id.substring(11);
                        window.sessionStorage.setItem("id_aoi", id_aoi);                    
                        window.location = 'obs_list.html';
                        return false; 
                    });
                    $("[id^=edit_idaoi_]").click(function(e) {
                        e.preventDefault(); 
                        var id_aoi = this.id.substring(11);
                        window.sessionStorage.setItem("id_aoi", id_aoi);                    
                        window.location = 'aoi_form.html';
                        return false; 
                    }); 
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
                });
            }, function (error) {
                console.log('transaction AOI error: ' + error.message);
            }, function () {
                console.log('transaction AOI ok');                
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
            /*
            window.sessionStorage.setItem("bbox_xmin", "39.826");
            window.sessionStorage.setItem("bbox_xmax", "39.839");
            window.sessionStorage.setItem("bbox_ymin", "-7.713");
            window.sessionStorage.setItem("bbox_ymax", "-7.696");
            */

            window.location = 'aoi_form.html';
            return false;
        });
    },
    onOffline: function() {
        $('.add_edit_delete_aoi').hide();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    },
    delete_aoi: function(id_aoi) {
        db.transaction(function(tx) {
            var sqlstr = "DELETE FROM aoi WHERE id = " + id_aoi + ";";
            tx.executeSql(sqlstr);
        }, function(error) {
            console.log('Transaction delete aoi ERROR: ' + error.message);
        }, function() {
            console.log('deleted AOI table OK');
            window.location = 'aoi_list.html';
        });
    }
};

listAOI.initialize();