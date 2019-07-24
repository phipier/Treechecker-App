var listRegions = {
    // Page Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        document.addEventListener("backbutton", onBackKeyDown, false);
        
        createTables();

        loadRegions();

        $('#sidebarCollapse').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
        });

        $('#update').on('click', function() {
            window.plugins.spinnerDialog.show();
            update();
            loadRegions();
        });
    },

    onOnline: function() {
        if (window.sessionStorage.getItem("stayOffline") === "true") {
            stayOffline();
        } else {
            $('#sidebarCollapse').show();
        }
    },

    onOffline: function() {
        stayOffline();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listRegions.initialize();

function stayOffline() {
    $('#sidebarCollapse').hide();
}

function onBackKeyDown() {
    window.location = "login.html";
}

function loadRegions() {
    db.transaction(function (tx) {
        window.plugins.spinnerDialog.show();
        var query = 'SELECT * FROM geographicalzone';
        tx.executeSql(query, [], function (tx, res) {
            var html = '<ul class="list-group">';
            for(var x = 0; x < res.rows.length; x++) {
                html += '<li class="list-group-item">'                                 
                + '<h5>' + res.rows.item(x).name + '</h5>'
                + '<a id="idreg'+res.rows.item(x).id+'" href="#" class="btn button button-navbar m-2"><i class="fas fa-door-open fa-2x white"></i></a>'
                + '</li>';
                //window.sessionStorage.setItem("wms_url_"+res.rows.item(x).id, res.rows.item(x).wms_url);
            }
            html += "</ul>";
            $("#listregions-page").html(html);
            $("[id^=idreg]").click(function(e) {
                window.plugins.spinnerDialog.show();

                e.preventDefault();                
                var id_region = this.id.substring(5);
                window.sessionStorage.setItem("id_region", id_region);
                var query = 'SELECT * FROM geographicalzone where id = ' + id_region + ';';
                db.transaction(function (tx) {
                    tx.executeSql(query, [], function (tx, res) {                    
                        window.sessionStorage.setItem("wms_url",  res.rows.item(0).wms_url); //JSON.stringify(res.rows.item(0).wms_url));     
                        window.sessionStorage.setItem("reg_xmin", res.rows.item(0).x_min);
                        window.sessionStorage.setItem("reg_xmax", res.rows.item(0).x_max);
                        window.sessionStorage.setItem("reg_ymin", res.rows.item(0).y_min);
                        window.sessionStorage.setItem("reg_ymax", res.rows.item(0).y_max);  
                        window.plugins.spinnerDialog.hide();
                        window.location = 'aoi_list.html';                    
                    }, function (tx, error) {console.log("error in db request: SELECT geographicalzone where id")});
                },
                function (error) {
                    console.log('Transaction error : ' + error.message);
                    window.plugins.spinnerDialog.hide();
                },
                function () {
                    console.log('transaction ok');
                    window.plugins.spinnerDialog.hide();
                }); 
                return false;
            });            
        },
        function (tx, error) {
            console.log('SELECT error: ' + error.message);
            window.plugins.spinnerDialog.hide();
        });
    }, function (error) {
        console.log('transaction error: ' + error.message);
        window.plugins.spinnerDialog.hide();
    }, function () {
        console.log('transaction ok');
        window.plugins.spinnerDialog.hide();
    });
}