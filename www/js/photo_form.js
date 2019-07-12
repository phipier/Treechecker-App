var photoform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        document.addEventListener("backbutton", onBackKeyDown, false);
        init_form();

        $('#photo').on('click', function() {
            navigator.camera.getPicture(
                function(imageData) {
                    $('#preview_text').remove();
                    var format = "data:image/jpeg;base64,";
                    document.getElementById('image').src = format + imageData;   
                    //$('#image').src = format + imageData;                  
                },
                function() {
                    displayMessage("Picture canceled", function() {})                    
                },
                {quality:50, destinationType:Camera.DestinationType.DATA_URL, correctOrientation: true}
            );
            return false;
        });
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

function insert_photo(photo,obsid) {
    db.transaction(function(tx) {
        var sql =
            "REPLACE INTO photo_tmp(id, id_surveydata, compass, image) "
            + "VALUES(" + photo.id + "," + obsid + "," + "0" + ",'" + photo.image + "');";
        tx.executeSql(sql, [],
            function(tx, res) {
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
    window.sessionStorage.setItem("photo_comment",            $("#InputPhotocomment").val().trim());
    window.sessionStorage.setItem("photo_compassbearing",     $("#compassbearing").val().trim());
    window.sessionStorage.setItem("photo_GPSbearing",         $("#GPSbearing").val().trim());
    window.sessionStorage.setItem("photo_image",            document.getElementById('image').src);
}

function getWSitems() {
    var photo = {};
    photo.comment =         window.sessionStorage.getItem("photo_comment");
    photo.compassbearing =    window.sessionStorage.getItem("photo_compassbearing");
    photo.GPSbearing =        window.sessionStorage.getItem("photo_GPSbearing");
    photo.image =             window.sessionStorage.getItem("photo_image");
   
    if (!photo.id) {
        photo.id = "NULL";
    }    
    return photo;
}

function clearWSitems() {        
    window.sessionStorage.removeItem("photo_comment");
    window.sessionStorage.removeItem("photo_compassbearing");
    window.sessionStorage.removeItem("photo_GPSbearing");
    window.sessionStorage.removeItem("photo_image");    
}

function init_form() {  
    var obs = getWSitems();
    var id_obs = obs.id;
    $("#photo_comment")         .val(photo.comment);
    $("#photo_compassbearing")  .val(photo.compassbearing);
    $("#photo_GPSbearing")      .val(photo.GPSbearing);
    $("#photo_image")           .val(photo.image);
    if (photo.image) {
        $('#preview_text').remove();
        document.getElementById('image').src = obs.photo.image;
    }    
    window.plugins.spinnerDialog.hide();
};