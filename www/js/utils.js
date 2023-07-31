function isNumberKey(evt)
{
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31
    && (charCode < 48 || charCode > 57))
    return false;
    return true;
}

// Function to escape special characters in a string for SQLite
function escapeSQLiteString(str) {
    // Replace single quotes, double quotes, backslashes, and null characters with space
    return str.replace(/['"\\]/g, ' ').replace(/\u0000/g, ' ');
}

function displayMessage(message, action_OK, action_cancel) {
    if(document.getElementById("messagepopupdata").getElementsByTagName('p').length > 0) {
        $("#messagepopupdata>p").html("");
    }
    $("#messagepopupdata").prepend("<p><i class='fas'></i> " + message + "</p>");
    $('#messagepopup').modal('show');

    $("#ok_sent").one("click", function(e) {
        e.preventDefault();
        $("#messagepopup").modal("hide");
        if (typeof action_OK !== 'undefined') {
            action_OK();
        }
        return false;
    });    

    if (typeof action_cancel === 'undefined')   
        {   $("#cancel_sent").hide();}
    else                                        
        {   
            $("#cancel_sent").one("click", function(e) {
                e.preventDefault();  
                $("#messagepopup").modal("hide");             
                action_cancel();
                return false;
            });
        }
}

function clearWSitems_obs() { 
    window.sessionStorage.removeItem("obs_uploaded");       
    window.sessionStorage.removeItem("obs_id");
    window.sessionStorage.removeItem("obs_name");
    window.sessionStorage.removeItem("obs_comment");
    window.sessionStorage.removeItem("obs_id_tree_species");
    window.sessionStorage.removeItem("obs_id_crown_diameter");
    window.sessionStorage.removeItem("obs_id_canopy_status");
    window.sessionStorage.removeItem("obs_latitude");
    window.sessionStorage.removeItem("obs_longitude");
    window.sessionStorage.removeItem("photo_id");
    window.sessionStorage.removeItem("photo_comment");
    window.sessionStorage.removeItem("photo_compassbearing");
    window.sessionStorage.removeItem("photo_image");     
}

function getAsync(url_request) {            
    return new Promise(function(resolve, reject) {
        var token       = window.sessionStorage.getItem("token");
        var serverurl   = window.sessionStorage.getItem("serverurl")
        $.ajax({
            type : 'GET',
            crossDomain : true,
            url : serverurl + url_request,
            beforeSend: function(xhr)                {xhr.setRequestHeader('Authorization', 'JWT ' + token);},
            success :   function(reg)                {resolve(reg);},
            error :     function(req, status, error) {reject(error);}
        });
    })
};

function getAsync2(url_request) {            
    return new Promise(function(resolve, reject) {
        $.ajax({
            type : 'GET',
            crossDomain : true,
            url : url_request,            
            success :   function(reg)                {resolve(reg);},
            error :     function(req, status, error) {reject(error);}
        });
    })
};

// Function to get the current time as a string
function getCurrentTimeAsString() {
    const currentTime = new Date();
    return currentTime.toISOString(); // Convert to ISO string for easy storage and comparison
}

// Function to check if the time difference is greater than 45 minutes
function getTokenAge() {
    const currentTime = new Date();
    const loginTime = window.sessionStorage.getItem('loginTime');
    const loginTimeObject = new Date(loginTime);
    const timeDifferenceInMilliseconds = currentTime - loginTimeObject;
    const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);

    return timeDifferenceInMinutes;
}


function refreshToken() {
    return new Promise((resolve, reject) => {
        var token = window.sessionStorage.getItem("token");
        $.ajax({
            async: true,
            crossDomain: true,
            url: window.sessionStorage.getItem("serverurl") + "/api-token-refresh/", 
            method: "POST",
            headers: {
                "Authorization": "JWT " + token,
                "Content-Type": "application/json",
            },
            data: JSON.stringify({ "token": token }), 
            processData: false,
            success: function (data) {
                // Token refreshed successfully
                console.log(data.token)
                window.sessionStorage.setItem("token", data.token);
                const loginTime = getCurrentTimeAsString();
                window.sessionStorage.setItem('loginTime', loginTime);
                resolve();
            },
            error: function (xhr, status, error) {
                //if (xhr.status === 401) {              
                    reject();
                //}
            }
        });
    });
}
