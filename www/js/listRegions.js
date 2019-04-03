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

         db.transaction(function (tx) {
                var query = 'SELECT * FROM geographicalzone';
                tx.executeSql(query, [], function (tx, res) {
                    var html = "";
                    for(var x = 0; x < res.rows.length; x++) {
                        html += '<div class="card"><img id="img-card" class="card-img-top" src="img/' + res.rows.item(x).image_url + '" alt="Image"><div class="card-body"><h5 class="card-title">' + res.rows.item(x).name + '</h5><a href="map.html" class="btn button">Go</a></div></div>';
                    }
                    $("#listregions-page").html(html);
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

        $('#sidebarCollapse').on('click', function() {
            $('#sidebar').toggleClass('active');
            $('.overlay').toggleClass('active');
        });

        $('#update-regions').on('click', function() {
            window.plugins.spinnerDialog.show();
            $.ajax({
                type : 'GET',
                crossDomain : true,
                url : URLSERVER + '/api/gzs/',
                beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
                success : function(reg) {
                    $.each(reg, function(key, val) {
                        db.transaction(function(tx) {
                            var sqlstr = "REPLACE INTO geographicalzone("
                            + "id, name, layer_name, wms_url, proj, image_url, x_min, x_max, y_min, y_max) "
                            + "VALUES("+val.key+",'"+val.name+"','layer_name','wms_url','proj'"
                            + ",'"+val.image_url+"',"+val.bbox[0]+","+val.bbox[1]+","+val.bbox[2]+","+val.bbox[3]+")";
                            
                            tx.executeSql(sqlstr);                            
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
