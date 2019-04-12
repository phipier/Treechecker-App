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
        $('#send_data').click(function(event) {
			console.log("TRCK send data");
            window.plugins.spinnerDialog.show();
            $('#errorpopupdata').children("p").remove();
            $(this).attr('disabled', 'disabled');
            $.ajax({
                type : 'POST',
                crossDomain : true,
                dataType : 'text',
                url : SERVERURL + '/api-token-auth/',
                data : {
                    //email : $("#username").val(),
                    //password : $("#password").val()
                    email : 'pier@test.com',
                    password : 'trEEchecker789'
                },
                contentType: 'application/x-www-form-urlencoded',
                success : function(tk) {
					console.log("TRCK success");
                    window.plugins.spinnerDialog.hide();
                    window.sessionStorage.setItem("token", $.parseJSON(tk).token);
                    window.location = 'region_list.html';
                },
                error : function(req, status, error) {
                    if (status == "error") {
						console.log("TRCK error");
                        login.onErrorNotFound();
                    } else {
						console.log("TRCK else");
                        setTimeout(function(){login.onError();}, 500);
                    }
                }
            })
            event.preventDefault();
            event.stopPropagation();
        });

        $('#ok_sent_error').click(function() {
            $('#send_data').removeAttr('disabled');
        });
    },

    onOnline: function() {
        if(document.getElementById("noconnection") !== null) {
            $("#noconnection").popup("close");
        };
    },

    onErrorNotFound: function() {
        window.plugins.spinnerDialog.hide();
        if(document.getElementById("errorpopupdata").getElementsByTagName('p').length <= 0) {
            $("#errorpopupdata").prepend("<p>Wrong username and/or password.</p>");
        }
        $("#errorpopupdata").popup("open", {transition:"fade",positionTo:"window"});
    },

    onError: function() {
        window.plugins.spinnerDialog.hide();
        if(document.getElementById("errorpopupdata").getElementsByTagName('p').length <= 0){
            $("#errorpopupdata").prepend("<p>Error - No connection to the DB.</p>");
        }
        $("#errorpopupdata").popup("open", {transition:"fade",positionTo:"window"});
    },

    onOffline: function() {
        window.plugins.spinnerDialog.hide();
        if(document.getElementById("errorpopupdata") !== null) {
            $("#errorpopupdata").popup("close");
        };
        $("#noconnection").popup("open", {transition:"fade",positionTo:"window"});
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

login.initialize();
