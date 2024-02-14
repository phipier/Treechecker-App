# Treechecker App
  
1. [Introduction](#introduction)  
    1. [Installing the Treechecker app on Android](#install)
    2. [Comments on the use of compass and GPS with an Android Device](#GPS)
2. [Configure Treechecker server](#server)
3. [Log-in the Treechecker App](#login)
    1. [Add an Area of Interest (AOI)](#aoi)
    2. [Add observations](#addobs)
    3. [Upload observations](#uploadobs)
    4. [Download observations](#dldobs)

4. [Technical documentation](#technical)  
    1. [Development environment set up](#devenv)
    2. [Build APK](#buildapk)


### Introduction <a name="introduction"></a>

The Treechecker app (and server) is an Android app enabling tree survey using offline maps. When online, the app first downloads WMS tiles (From a WMS layer of the user’s choice) on the Android device. It is then possible to visualize the layer offline while overlaying the location provided by the GPS of the Android device. When online, the app will upload the observations made on the field back to the Treechecker server.  

To use the Treechecker you will need to set up and configure a Treechecker server. If you have not already set up your own Treechecker server then please go to chapter “How to set up a new Treechecker-server on Pythonanywhere” at [Treechecker-server](https://phipier.github.io/Treechecker-server/#installation1)

### Installing the Treechecker app on Android <a name="install"></a>

Download and install the last version of the Treechecker App at https://cutt.ly/7rqZ5UZ

### Comments on the use of compass and GPS with an Android Device <a name="GPS"></a>

* Compass calibration

To be able to measure the compass heading, the device compass will need to be calibrated. You will find instructions on how to do it at the following link: https://support.google.com/maps/answer/2839911?co=GENIE.Platform%3DAndroid&hl=en  

* GPS

In order to use the Android device GPS efficiently, you may want to follow these recommendations:

Geolocation should be set to "high precision" mode. For more information, please consult https://support.google.com/maps/answer/2839911?co=GENIE.Platform%3DAndroid&hl=en

To save battery while using GPS, your device should be set to flight mode.

### Configure Treechecker server <a name="server"></a>
Before using the Treechecker App you will need to configure the Treechecker server by adding at least one Region of Interest.	

| | |
|---|---|
| <img src="docs/screenshots/Admin1.png" width="2500"/>|Navigate to the Treechecker server admin page (e.g. if you set up a Treechecker server using the Pythonanywhere service, the URL should be: your-username.pythonanywhere.com/config ). If you have not yet set up a Treechecker server, go to ... |
| <img src="docs/screenshots/Admin5_Regions.png" width="2500"/>|By clicking on “Geographical Zones”, the list of Geographical zones will appear. Click on button “Add Geographical Zone” at the top right-end corner of the screen.|
| <img src="docs/screenshots/Admin1.png" width="2500"/>|The Geographical Zone (same as Region of Interest) creation form will appear.|

The WMS layers information is stored as a JSON format string and splits into two parts:

* BASE_WMS : A list of Background layers (For now, these tiles are not downloaded onto the device, the layer is only visible at AOI creation time)
* DL_WMS : A list of WMS whose tiles will be downloaded when creating an area of interest (AOI) from the app.  

For example:
```
{  
"BASE_WMS":[  
    {  
        "name":"OSM",  
        "layerName":"OSM",  
        "url":"https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",  
        "attribution":"Map data © <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors",  
        "maxZoom":"22",  
        "maxNativeZoom":"19"  
    }  
],  
"DL_WMS":[  
    {  
        "name":"Lombardia",  
        "url":"https://www.cartografia.servizirl.it/viewer31/proxy/proxy.jsp?https://www.cartografia.servizirl.it/arcgis2/services/BaseMap/ortofoto2007UTM/ImageServer/WMSServer?",  
        "layers":"0",  
        "format":"image/png",  
        "transparent":"true",  
        "version":"1.1.0",  
        "height":256,  
        "width":256,  
        "crs":"EPSG:4326",  
        "maxZoom":"22",  
        "maxNativeZoom":"19"  
    }  
]  
}  
```
* Additional vector data
    
It is also possible to include additional features to be displaid on map. Only GeoJSON format is accepted.

For example:

```
[{
    "type": "LineString",
    "coordinates": [[9.7, 45.67], [9.8, 45.77], [9.9, 45.89]]
}, {
    "type": "LineString",
    "coordinates": [[8.7, 44.67], [8.8, 44.77], [8.9, 44.89]]
}]
```

### Log-in the Treechecker App <a name="login"></a>

| | |
|---|---|
| <img src="docs/screenshots/start.png" alt="start" width="500px"/>|On your Android device, start the Treechecker App. |
| <img src="docs/screenshots/Login_form.png" alt="login" width="500px"/>|On the login window, use the login and password created from the Treechecker server interface. Add the URL of your Treechecker server.|

By choosing the “stay offline” option, the app will not need an internet connection (e.g. when working on the field).  
In that case, you will be able to:

* Create and save observations on the device

You will NOT be able to:

* Update your Regions of Interest
* Create Areas of Interest (AOI)
* Upload your field observations to the Treechecker server

| | |
|---|---|
| <img src="docs/screenshots/ROI_mainmenu.png" alt="mainmenu" width="1000px"/>|The next screen shows the list of regions of interest. |
| <img src="docs/screenshots/ROI_menu.png" alt="menu" width="1000px"/>|If nothing is displayed and you have already set up a region of interest from the Treechecker server interface, then click on the menu in the top right-end corner and push the update button (For this you will need to be online). This action will download the latest regions available and created earlier on the Treechecker server.|

Once you selected a region of interest, the next screen will display the list of areas of interest for that region.  

### Add an Area of Interest (AOI) <a name="aoi"></a>

To add an AOI, it is necessary to be online (WIFI or mobile data). From the AOI list, push the “+” button to access the AOI creation form.  

| | |
|---|---|
|<img src="docs/screenshots/AOI_form1.png" width="1000"/>|Give a name to your area of interest and push the “select area on the map” button to select the area where you will do your survey.|
|<img src="docs/screenshots/AOI_form_map.png" width="1000"/>|You can use the zoom (+/-) and pan the map to position the square on the area you selected. The app will later download all the layer tiles corresponding to the selected zone. Then navigate back to the AOI creation form using the right pointing arrow located on the bottom right corner.|
|<img src="docs/screenshots/AOI_form3.png" width="1000"/>|Push the button the “tick” button in the bottom right corner to save your AOI and start downloading the tiles corresponding to the area you have selected.  If the selected area is too large, you will have to reduce its size. It is possible to cancel the downloading process by clicking on the red square.|
|<img src="docs/screenshots/AOI_list_full.png" width="1000"/>|When the downloading process has completed, the application will navigate back to the AOI list that will include the newly created AOI. For each AOI (Area of interest) in the list, there are two buttons. One to access the observations section and another one to delete the AOI. If you use the push button for an AOI that has not yet uploaded observations, there will be a warning.|

### Add observations <a name="addobs"></a>

| | |
|---|---|
|<img src="docs/screenshots/Observations_list.png" width="1000"/>|From the AOI list, select an AOI and push the observation button. The next screen will display the list of observations for the selected AOI. Push the “+” button to add an observation.|
|<img src="docs/screenshots/Observations_form_map2.png" width="1000"/>|The next screen will show the map on which to locate the observation. You may navigate the map (zoom/pan) and then click on the position of your observation.|
|<img src="docs/screenshots/Observations_form_map3_GPS.png" width="1000"/>|Another option is to turn on the GPS (top left button on the map) in order to let the map position itself and add a marker at your location (you will also have to set the GPS on your phone). You may adjust the marker location (push-drag-drop). The circle located around the marker symbolizes the GPS location accuracy.|

N.B: Android defines horizontal accuracy as the radius of 68% confidence. In other words, if you draw a circle centered at this location's latitude and longitude, and with a radius equal to the accuracy, then there is a 68% probability that the true location is inside the circle. This accuracy estimation is only concerned with horizontal accuracy, and does not indicate the accuracy of bearing (For more information about the GPS accuracy please go to https://developer.android.com/reference/android/location/Location.html#getAccuracy() )

After pushing the ‘next’ arrow, the observation form will appear.

| | |
|---|---|
|<img src="docs/screenshots/Observations_form1.png" width="300"/>|From the AOI list, select an AOI and push the observation button. The next screen will display the list of observations for the selected AOI. Push the “+” button to add an observation.|
|<img src="docs/screenshots/Observations_form_photo1.png" width="300"/>|You may add pictures from your smartphone camera by clicking on the “Add photo” button. The photo form will appear and you will be able to take a picture by pushing the camera button.|
|<img src="docs/screenshots/Observations_form_photo2.png" width="300"/>|You may add pictures from your smartphone camera by clicking on the “Add photo” button. The photo form will appear and you will be able to take a picture by pushing the camera button.
You may also add a bearing measure from the compass of your smartphone. For a matter of accuracy, you will position your smartphone horizontally and point the top part of your smartphone towards the subject of the photo you have taken. The compass bearing will then give the angle of the observer in respect to the magnetic North. You may also add a comment for the photo.|
|<img src="docs/screenshots/Observations_list2.png" width="300"/>|The next screen will take you back to the observation form. After validation of the observation form you will navigate back to the observation list. By pushing the map button, you will get an overall view of the observations that have been made fot that AOI so far.|

### Uploading observations to the Treechecker server <a name="uploadobs"></a>

| | |
|---|---|
|<img src="docs/screenshots/Observations_list_menu.png" width="500"/>|To upload observations, your device will need to be online. From the observation list, open the menu (top right corner) and push on “Upload observations". |
|<img src="docs/screenshots/Observations_list3_uploadedobs.png" width="500"/>|After the uploading process has completed, the uploaded observations will be marked as such in the observation list.|

### Downloading the field observation data <a name="dldobs"></a>

| | |
|---|---|
|<img src="docs/screenshots/Admin1.png" width="2500"/>|Navigate to the Treechecker server admin page (e.g. if you set up a server using the Pythonanywhere service, your URL is: your-username.pythonanywhere.com/config). To visualize the list of observations previously uploaded to the Treechecker server, click on “Survey Data”.|
|<img src="docs/screenshots/Admin2_surveydata.png" width="2500"/>|From the survey data page, it is possible to download the observation data by first selecting the data you would like to download and then selecting “Export selected” in the Action dropdown list. By clicking the “Go” button, it will create a file containing all the data selected and will download to your computer.|
|<img src="docs/screenshots/Admin3_surveydata.png" width="2500"/>|By clicking on a specific observation, it will display its information details. You can visualize individual observation.|
|<img src="docs/screenshots/Admin4_surveydata.png" width="2500"/>|and pictures.|


## Technical documentation <a name="technical"></a>

### Development environment setup <a name="devenv"></a>

To set up a development environment for the Treechecker app, the following applications should be installed:

* Java 1.8  
* npm  
* cordova 9  
* Android studio  

* Create the Android platform

```
$cordova platform add Android
```

## Build APK <a name="buildapk"></a>

If you have changed code in the app, you will need to compile a new APK. On your development machine, go to project folder and run:

```
$cordova platform remove android

$cordova platform add android

$bash buildrel (for a release build)

$bash builddebug (for a debug build)
```

Another option is to use a Docker container

search for a cordova image
```
docker search cordova
```
Possible image to use, download image
```
docker pull beevelop/cordova
```

Go to Cordova project directory and then, 
```
sudo docker run -i -v /$PWD:/workspace -w /workspace --privileged beevelop/cordova
```
To see what platforms are available 
```
cordova platform list
```

To add the platform android
```
cordova platform add android
```

Connect device to computer

To build the app
```
cordova build
```
Then, in order to list the attached devices:
```
adb devices
```
to run android
```
cordova run android
```
to debug application, open chrome and go to chrome://inspect/#devices

To remove and add plugins
```
cordova plugin rm cordova-plugin-camera 
cordova plugin add cordova-plugin-camera 
```
To create release APK
```
bash buildrel
```
