// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);
let scanningInterval;
let cameraOn = false;
let decoding = false;
let desiredTorchStatus = "on";

function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    cordova.plugins.DBR.init("",onInit);
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    var buttons = document.getElementsByClassName("control-button");
    for (let i=0;i<buttons.length;i++) {
        buttons[i].disabled = "";
    }
}

function destroy(){
    cordova.plugins.DBR.destroy();
}

function startScan(){
    console.log("start scan pressed");
    document.body.style.backgroundColor = "transparent";
    document.getElementById("results").innerHTML = "";
    addSVGOverlay(1280,720);
    cordova.plugins.DBR.startScanning("DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9", onScanned, onScanFailed);
}

function stopScan(){
    document.body.style.backgroundColor = "white";
    cordova.plugins.DBR.stopScanning();
}

function pauseScan(){
    cordova.plugins.DBR.pauseScanning();
}
function resumeScan(){
    cordova.plugins.DBR.resumeScanning();
}

function onScanned(scanResult){
    console.log("scanned");
    console.log(scanResult);
    showOverlayOnSVG(scanResult);
}

function onScanFailed(){
    console.log("start scan failed");
}

function switchTorch(){
    cordova.plugins.DBR.switchTorch(desiredTorchStatus);
    if (desiredTorchStatus == "on") {
        desiredTorchStatus = "off";
    } else {
        desiredTorchStatus = "on";
    }
}

function getResolution(){
    cordova.plugins.DBR.getResolution(onGotResolution);
}

function onGotResolution(res){
    alert(res);
}

function addSVGOverlay(width, height){
    var overlayContainer = document.getElementsByClassName("overlay")[0];
    if (overlayContainer.getElementsByTagName("svg").length>0) {
        return;
    }
    //var video = document.getElementsByClassName("dbrScanner-video")[0];
    var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.style.top = 0;
    svg.style.left = 0;
    svg.style.position = "absolute";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.zIndex = 0;
    svg.setAttribute("viewBox","0 0 "+width+" "+height);
    overlayContainer.appendChild(svg);
}

function showOverlayOnSVG(scanResult){
    var overlayContainer = document.getElementsByClassName("overlay")[0];
    if (overlayContainer.getElementsByTagName("svg").length>0) {
        var svg = overlayContainer.getElementsByTagName("svg")[0];
        svg.innerHTML=""
        var results = scanResult.results;
        svg.setAttribute("viewBox","0 0 "+scanResult.frameWidth+" "+scanResult.frameHeight);
        for(let i = 0; i < results.length; i++){
            var result = results[i];
            var points = getPointsData(result);
            var a = document.createElementNS("http://www.w3.org/2000/svg","a");
            var polygon = document.createElementNS("http://www.w3.org/2000/svg","polygon");
            polygon.setAttribute("points",points);
            polygon.setAttribute("class","barcode-polygon");

            var text = document.createElementNS("http://www.w3.org/2000/svg","text");
            text.setAttribute("x",result.x1);
            text.setAttribute("y",result.y1);
            text.setAttribute("fill","red");
            text.textContent = result.barcodeText;
            text.style.fontSize = 20;
            a.append(polygon);
            a.append(text);
            svg.append(a);
        }
    }
}

function getPointsData(lr){
    var pointsData = lr.x1+","+lr.y1 + " ";
    pointsData = pointsData+ lr.x2+","+lr.y2 + " ";
    pointsData = pointsData+ lr.x3+","+lr.y3 + " ";
    pointsData = pointsData+ lr.x4+","+lr.y4;
    return pointsData;
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
    decoding = false;
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
