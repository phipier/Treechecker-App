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
        window.plugins.spinnerDialog.hide();
        if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
            $("#errorpopupdata>p").html("");
        }
        $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i>No connection to remote server?</p>");
        //$("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - Wrong username and/or password.</p>");
        $('#errorpopup').modal('show');
    },

    onError: function() {
        window.plugins.spinnerDialog.hide();
        if(document.getElementById("errorpopupdata").getElementsByTagName('p').length > 0) {
            $("#errorpopupdata>p").html("");
        }
        $("#errorpopupdata").prepend("<p><i class='fas fa-exclamation-circle'></i> Error - No connection to the DB.</p>");
        $('#errorpopup').modal('show');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

login.initialize();