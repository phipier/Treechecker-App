var listRegions = {
    // Page Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        var token = window.sessionStorage.getItem("token");

        listRegions = function (tx, res) {
            var html = "";
            $.each(res, function(key, val) {
                html += '<div class="card"><img id="img-card" class="card-img-top" src="img/' + val.image_url + '" alt="Image"><div class="card-body"><h5 class="card-title">' + val.name + '</h5><a href="map.html" class="btn button">Go</a></div></div>';
            });
            $("#listregions-page").html(html);
            window.plugins.spinnerDialog.hide();
        }
        getRegions(listRegions);

        /*
            error : function(req, status, error) {
                window.plugins.spinnerDialog.hide();
                if(document.getElementById("errorpopupdata").getElementsByTagName('p').length <= 0){
                    $("#errorpopupdata").prepend("<p>Error - No connection to the DB.</p>");
                }
                $("#errorpopupdata").popup("open", {transition:"fade",positionTo:"window"});
            }
        })*/

        $('#sidebarCollapse').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
        });

        $('#update-regions').on('click', function() {
            window.plugins.spinnerDialog.show();
            $.ajax({
                type : 'GET',
                crossDomain : true,
                url : 'http://127.0.0.1:8001/api/gzs/',
                beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
                success : function(reg) {
                    $.each(reg, function(key, val) {
                        db.transaction(function(tx) {
                            tx.executeSql("REPLACE INTO geographicalzone(id, name, layer_name, wms_url, proj, image_url, x_min, x_max, y_min, y_max) VALUES(" + val.id + "," + val.name + "," + val.layer_name + "," + val.wms_url + "," + val.proj + "," + val.image_url + "," + val.x_min + "," + val.x_max + "," + val.y_min + "," + val.y_max + ")");
                        }, function(error) {
                             console.log('Transaction ERROR: ' + error.message);
                           }, function() {
                             console.log('Populated database OK');
                           });
                    });
                    window.plugins.spinnerDialog.hide();
                },
                error : function(req, status, error) {
                    window.plugins.spinnerDialog.hide();
                    if(document.getElementById("errorpopupdata").getElementsByTagName('p').length <= 0){
                        $("#errorpopupdata").prepend("<p>Error - No connection to the DB.</p>");
                    }
                    $("#errorpopupdata").popup("open", {transition:"fade",positionTo:"window"});
                }
            })
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listRegions.initialize();