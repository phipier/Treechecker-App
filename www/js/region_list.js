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

        createTables();

        db.transaction(function (tx) {
            var query = 'SELECT * FROM geographicalzone';
            tx.executeSql(query, [], function (tx, res) {
                var html = "";
                for(var x = 0; x < res.rows.length; x++) {
                    html += '<div class="card"><img id="img-card" class="card-img-top" src="img/' 
                    + res.rows.item(x).image_url 
                    + '" alt="Image"><div class="card-body"><h5 class="card-title">' 
                    + res.rows.item(x).name
                    + '</h5><a id="lr'+res.rows.item(x).id+'" href="aoi_list.html" class="btn button">Go</a></div></div>';
                }                    
                $("span[id$=lr]").click( function(e) {
                    e.preventDefault(); 
                    window.sessionStorage.setItem("id_region", e.id);
                    window.location = 'aoi_list.html';
                    return false; } );
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

        $('#update').on('click', function() {
            window.plugins.spinnerDialog.show();
            update();            
        });
        $('#sync').on('click', function() {
            window.plugins.spinnerDialog.show();            
            synchronize();
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listRegions.initialize();
