var flag_measuring = false;

var photoform = {    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        window.plugins.spinnerDialog.show();
        document.addEventListener("backbutton", onBackKeyDown, false);
        init_form();

        $('#editphoto').on('click', function() {
            //e.preventDefault();
            navigator.camera.getPicture(
                function(imageData) {                    
                    $('#preview_text').remove();
                    var format = "data:image/jpeg;base64,";
                    var img_src = format + imageData;
                    document.getElementById('image').src = img_src;
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

/* function onSuccess(heading) {
    compassbearing = heading.magneticHeading;
    $("#InputCompassbearing").val(compassbearing);
};

function onError(compassError) {
    alert('Compass error: ' + compassError.code);  
};

var options = {
    frequency: 1000
}; 

var watchID; */

$("#btncompass").click(function(e) {
    e.preventDefault();       

/*     if (!flag_measuring) 
    {
        flag_measuring = true;

        watchID = navigator.compass.watchHeading(onSuccess, onError, options);

        //$("#btncompass").text("Stop measuring");
        $("#InputCompassbearing").prop('disabled', true);
    }
    else {
        flag_measuring = false;

        navigator.compass.clearWatch(watchID);

        setWSitems();

        //$("#btncompass").text("Start measuring compass bearing"); 
        $("#InputCompassbearing").prop('disabled', false);     
    } */

    if (!flag_measuring) 
    {
        flag_measuring = true;

        window.addEventListener("deviceorientationabsolute", getorientation, true);
        window.addEventListener("compassneedscalibration", needscalibration, true);

        //$("#btncompass").text("Stop measuring");
        $("#InputCompassbearing").prop('disabled', true);
    }
    else {
        flag_measuring = false;

        window.removeEventListener("deviceorientationabsolute", getorientation, true);
        window.removeEventListener("compassneedscalibration", needscalibration, true);

        setWSitems();

        //$("#btncompass").text("Start measuring compass bearing"); 
        $("#InputCompassbearing").prop('disabled', false);     
    }
    return false;
});

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

function getorientation(event) {
    compassbearing = Number(360 - event.alpha).toFixed(1);
    $("#InputCompassbearing").val(compassbearing);
}

function needscalibration(event) {
    alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
    event.preventDefault();
}

function insert_photo(photo) {
    var err = false;
    runSQL2("REPLACE INTO photo (id, id_surveydata, compass, image, comment) "
    + "VALUES(" + photo.id + "," + photo.obsid + "," + photo.compassbearing + ",'" + photo.image + "','" + photo.comment + "');")   
    .then((res) => {     
        console.log("replace in photo table done ... ");
    }, (value) => {       
        handleError("It was not possible to replace photo - " + value);
        err = true;
    })
    .finally(function() {
        window.plugins.spinnerDialog.hide();      
        if (!err) {window.location = "obs_form.html#carouselscroll";}
    });
}

function setWSitems() {
    window.sessionStorage.setItem("photo_comment",          $("#InputPhotocomment").val().trim());
    window.sessionStorage.setItem("photo_compassbearing",   $("#InputCompassbearing").val().trim());
    //window.sessionStorage.setItem("photo_GPSbearing",       $("#GPSbearing").val().trim());
    window.sessionStorage.setItem("photo_image",            document.getElementById('image').src);
}

function getWSitems() {
    var photo = {};
    photo.comment =           window.sessionStorage.getItem("photo_comment");
    photo.compassbearing =    window.sessionStorage.getItem("photo_compassbearing");
    photo.image =             window.sessionStorage.getItem("photo_image");
    photo.obsid =             window.sessionStorage.getItem("obs_id");
   
    if (!photo.id) {
        photo.id = "NULL";
    }    
    if (!photo.obsid) {
        photo.obsid = "NULL";
    }
    if (!photo.compassbearing) {
        photo.compassbearing = "NULL";
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
    var photo = getWSitems();
    var id_obs = window.sessionStorage.getItem("obs_id");
    $("#InputPhotocomment")         .text(photo.comment);
    $("#InputCompassbearing")       .val(photo.compassbearing=="NULL"?"":photo.compassbearing);
    //$("#photo_GPSbearing")      .val(photo.GPSbearing);
    if (photo.image) {
        $('#preview_text').remove();
        document.getElementById('image').src = window.sessionStorage.getItem("photo_image"); 
    }    
    window.plugins.spinnerDialog.hide();
};