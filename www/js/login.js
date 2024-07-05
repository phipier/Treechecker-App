var email;
var password;

const SERVERURL = 'https://treechecker.eu.pythonanywhere.com';
//const SERVERURL = 'http://127.0.0.1:8001';

var login = {

    // Login Page Constructor
    initialize: function() {
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);
    },

    // deviceready Event Handler
    onDeviceReady: function() {
        email       = window.localStorage.getItem("trckl");
        password    = window.localStorage.getItem("trckp");
        url         = window.localStorage.getItem("trckurl");

        $("#username").val(email);
        $("#password").val(password);
        if (!url) {url = SERVERURL}
        $("#serverurl").val(url);
        
        $('#log_in').click(function(event) {
            window.plugins.spinnerDialog.show();
            
            email       = $("#username").val();
            password    = $("#password").val();
            trckurl     = $("#serverurl").val();

            $(this).attr('disabled', 'disabled');
            $.ajax({
                type: 'POST',
                crossDomain: true,
                dataType: 'text',
                url: trckurl + '/api-token-auth/',
                data: {
                    email:      email,
                    password:   password
                },
                contentType: 'application/x-www-form-urlencoded',
                success: function(tk) {
                    window.plugins.spinnerDialog.hide();
                    window.sessionStorage.setItem("token", $.parseJSON(tk).token);

                    const loginTime = getCurrentTimeAsString();
                    window.sessionStorage.setItem('loginTime', loginTime);
                    
                    window.localStorage.setItem("trckl", email);       
                    window.localStorage.setItem("trckp", password); 
                    window.localStorage.setItem("trckurl", trckurl);
                    window.sessionStorage.setItem("email", email);
                    window.sessionStorage.setItem("password", password);
                    window.sessionStorage.setItem("serverurl", trckurl);
                    
                    window.sessionStorage.setItem("stayOffline","false");
                    


                    window.location = 'region_list.html';
                    
                },
                error: function(req, status, error) {
                    if (status == "error") {
                        login.onErrorNotFound();                        
                    } 
                    window.plugins.spinnerDialog.hide();
                    /* else {
                        setTimeout(function(){login.onError();}, 500);
                    } */
                },
                complete: function() {   
                    $("#log_in").removeAttr("disabled");                   
                    window.plugins.spinnerDialog.hide();
                }
            })
            event.preventDefault();
            event.stopPropagation();
        });

        $('#ok_sent_error').click(function() {
            $('#log_in').removeAttr('disabled');
        });

        $('#useOffline').click(function(event) {
            window.sessionStorage.setItem("stayOffline","true");
            window.location = 'region_list.html';
            event.preventDefault();
            event.stopPropagation();
        });
    },

    onErrorNotFound: function() {
        displayMessage("Please check your login/password and your connection to remote server");
    },

    onError: function() {
        displayMessage("Please check your login/password and your connection to remote server");
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

login.initialize();
