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
        $.ajax({
            type : 'GET',
            crossDomain : true,
            url : 'http://127.0.0.1:8001/api/gzs/',
            beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'JWT ' + token);},
            success : function(reg) {
                window.plugins.spinnerDialog.hide();
                var html = "";
                $.each(reg, function(key, val) {
                    html += '<div class="card"><img id="img-card" class="card-img-top" src="img/' + val.image_url + '" alt="Image"><div class="card-body"><h5 class="card-title">' + val.name + '</h5><a href="map.html" class="btn button">Go</a></div></div>';
                });
                $("#listregions-page").html(html);
            },
            error : function(req, status, error) {
                window.plugins.spinnerDialog.hide();
                if(document.getElementById("errorpopupdata").getElementsByTagName('p').length <= 0){
                    $("#errorpopupdata").prepend("<p>Error - No connection to the DB.</p>");
                }
                $("#errorpopupdata").popup("open", {transition:"fade",positionTo:"window"});
            }
        })
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

listRegions.initialize();