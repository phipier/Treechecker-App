var photoform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        document.addEventListener("backbutton", onBackKeyDown, false);
        init_form();

        window.addEventListener("deviceorientation", function(event) {
            compassbearing = 360 - event.alpha;
            $("#compassbearing").val(compassbearing);
        }, true);

        window.addEventListener("compassneedscalibration", function(event) {
            alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
            event.preventDefault();
        }, true);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

photoform.initialize();

$("#cancelphoto").click( function(e) {
    e.preventDefault();
    cancel_Photo();
    return false;
});

function onBackKeyDown() {
    cancel_Photo();
}

function cancel_Photo() {
    clearWSitems(); 
    window.location = "obs_form.html";
}

$("#savephoto").click( function(e) {
    e.preventDefault();    
    if ($("#Photo-form")[0].checkValidity() === false) {
        $("#Photo-form")[0].classList.add('was-validated');
        return false;
    } else {
        $("#Photo-form")[0].classList.add('was-validated');
    }    
    setWSitems();
    insert_photo(getWSitems());
    return false;
});

function insert_photo(photo) {
    db.transaction(function(tx) {
        var obsid = window.sessionStorage.getItem("obs_id");
        var sql = "REPLACE INTO photo (id, id_surveydata, compass, image) "
            + "VALUES(" + photo.id + "," + obsid + "," + photo.compassbearing + ",'" + photo.image + "');";
        tx.executeSql(sql, [],
            function(tx, res) {
                console.log('Photo inserted: ' + error.message);
                window.sessionStorage.setItem("photo_id", res.insertId);
            },
            function(tx, error) {
                console.log('ExecuteSQL Photo error: ' + error.message);
            }
        );
    }, function(error) {
        console.log('Transaction photo temp ERROR: ' + error.message);
        displayMessage("Error - It was not possible to store the photo.",()=>{});
    }, function() {
        cancel_Photo();
    });
}

function setWSitems() {
    window.sessionStorage.setItem("photo_comment",          $("#InputPhotocomment").val().trim());
    window.sessionStorage.setItem("photo_compassbearing",   $("#compassbearing").val().trim());
    //window.sessionStorage.setItem("photo_GPSbearing",       $("#GPSbearing").val().trim());
    window.sessionStorage.setItem("photo_image",            document.getElementById('image').src);
}

function getWSitems() {
    var photo = {};
    photo.comment =           window.sessionStorage.getItem("photo_comment");
    photo.compassbearing =    window.sessionStorage.getItem("photo_compassbearing");
    //photo.GPSbearing =        window.sessionStorage.getItem("photo_GPSbearing");
    photo.image =             window.sessionStorage.getItem("photo_image");
   
    if (!photo.id) {
        photo.id = "NULL";
    }    
    return photo;
}

function clearWSitems() {        
    window.sessionStorage.removeItem("photo_comment");
    window.sessionStorage.removeItem("photo_compassbearing");
    //window.sessionStorage.removeItem("photo_GPSbearing");
    window.sessionStorage.removeItem("photo_image");    
}

function init_form() {  
    var obs = getWSitems();
    var id_obs = window.sessionStorage.getItem("obs_id");
    $("#photo_comment")         .val(photo.comment);
    $("#photo_compassbearing")  .val(photo.compassbearing);
    //$("#photo_GPSbearing")      .val(photo.GPSbearing);
    $("#photo_image")           .val(photo.image);
    if (photo.image) {
        $('#preview_text').remove();
        document.getElementById('image').src = window.sessionStorage.getItem("photo_image"); 
    }    
    window.plugins.spinnerDialog.hide();
};