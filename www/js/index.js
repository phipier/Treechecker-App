var app = {
    // Application Constructor
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

    },

    onOnline: function() {
         $('#initApp').click(function() {
             window.location = 'login.html';
         });
    },

    onOffline: function() {
         $('#initApp').click(function() {
             window.location = 'region_list.html';
         });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

app.initialize();