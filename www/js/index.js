/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    cordova.plugins.DBR.init("",onInit);
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    var buttons = document.getElementsByClassName("control-button");
    for (let i=0;i<buttons.length;i++) {
        buttons[i].disabled = "";
    }
}

function takeAndDecode(){
    var srcType = Camera.PictureSourceType.CAMERA;
    openFilePicker(srcType);
}

function chooseAndDecode(){
    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    openFilePicker(srcType);
}

function onInit() {
    console.log("inited");
}

function onDecoded(results) {
    let resultHTML = "";
    if (results.length>0) {
        for (let i=0;i<results.length;i++) {
            let result = results[i];
            resultHTML = resultHTML + "<li>"
            resultHTML = resultHTML + result.barcodeFormat + ": " + result.barcodeText;
            resultHTML = resultHTML + "</li>"
        }  
    }else{
        resultHTML = "No barcodes found.";
    }
    
    document.getElementById("results").innerHTML = resultHTML;
}


function openFilePicker(srcType) {

    var options = setOptions(srcType);

    navigator.camera.getPicture(function cameraSuccess(base64) {
        document.getElementById("results").innerHTML = "decoding...";
        cordova.plugins.DBR.decode(base64,onDecoded);
    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");
    }, options);
}

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true
    }
    return options;
}
