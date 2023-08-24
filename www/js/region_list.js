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
    runSQL2('SELECT * FROM geographicalzone')
    .then((res1)=>{

        var html = '<ul class="list-group">';
        for(var x = 0; x < res1.rows.length; x++) {
            html += '<li class="list-group-item">'                                 
            + '<h5>' + res1.rows.item(x).name + '</h5>'
            + '<a id="idreg'+res1.rows.item(x).id+'" href="#" class="btn button button-navbar m-2"><i class="fa-solid fa-door-open fa-2x white"></i></a>'
            + '</li>';                
        }
        html += "</ul>";

        $("#listregions-page").html(html);

        $("[id^=idreg]").click(function(e) {

            window.plugins.spinnerDialog.show();
            e.preventDefault();                
            var id_region = this.id.substring(5);
            window.sessionStorage.setItem("id_region", id_region);

            runSQL2('SELECT * FROM geographicalzone where id = ' + id_region + ';')
            .then((res)=>{                  
                window.sessionStorage.setItem("wms_url",  res.rows.item(0).wms_url);
                window.sessionStorage.setItem("features", res.rows.item(0).features);     
                window.sessionStorage.setItem("reg_xmin", res.rows.item(0).x_min);
                window.sessionStorage.setItem("reg_xmax", res.rows.item(0).x_max);
                window.sessionStorage.setItem("reg_ymin", res.rows.item(0).y_min);
                window.sessionStorage.setItem("reg_ymax", res.rows.item(0).y_max);  
                window.location = 'aoi_list.html';           

            }, (error)=>{   displayMessage("error in db request: SELECT geographicalzone where id" + error,()=>{});
                            console.log("error in db request: SELECT geographicalzone where id" + error)})

            .finally(()=>{window.plugins.spinnerDialog.hide();});
            return false;
        });

    }, function (error) {console.log('transaction error: ' + error.message);})
    .finally(()=>{window.plugins.spinnerDialog.hide();});
}