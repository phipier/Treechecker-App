var email;
var password;

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

        $("#username").val(email);
        $("#password").val(password);

        $('#log_in').click(function(event) {
            window.plugins.spinnerDialog.show();
            
            email       = $("#username").val();
            password    = $("#password").val();

            $(this).attr('disabled', 'disabled');
            $.ajax({
                type: 'POST',
                crossDomain: true,
                dataType: 'text',
                url: SERVERURL + '/api-token-auth/',
                data: {
                    email:      email,
                    password:   password
                },
                contentType: 'application/x-www-form-urlencoded',
                success: function(tk) {
                    window.plugins.spinnerDialog.hide();
                    window.sessionStorage.setItem("token", $.parseJSON(tk).token);
                    
                    email = $("#username").val();
                    password = $("#password").val();

                    window.localStorage.setItem("trckl", email);       
                    window.localStorage.setItem("trckp", password); 
                    window.sessionStorage.setItem("email", email);
                    window.sessionStorage.setItem("password", password);

                    window.location = 'region_list.html';
                    
                },
                error: function(req, status, error) {
                    if (status == "error") {
                        login.onErrorNotFound();
                    } else {
                        setTimeout(function(){login.onError();}, 500);
                    }
                }
            })
            event.preventDefault();
            event.stopPropagation();
        });

        $('#ok_sent_error').click(function() {
            $('#log_in').removeAttr('disabled');
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