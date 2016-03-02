var pages = [],
    links = [];
var numLinks = 0;
var numPages = 0;
var pageTime = 800; //same as CSS transition
var preURL = "home";
var pageshow = document.createEvent("CustomEvent");
pageshow.initEvent("pageShow", false, true);
var c, context, i;
var thumbnail;
var jpeg;
var req;


var app = {
    loadRequirements: 0,
    init: function () {
        document.addEventListener("deviceready", app.onDeviceReady);
        document.addEventListener("DOMContentLoaded", app.onDomReady);

    },
    onDeviceReady: function () {
        app.loadRequirements++;
        if (app.loadRequirements === 2) {
            app.start();
        }
    },
    onDomReady: function () {
        app.loadRequirements++;
        app.start();

    },
    start: function () {

        app.pageshowevent();

    },
    //On which page you are currently navigating.
    pageshowevent: function () {

        pages = document.querySelectorAll('[data-role="page"]');
        numPages = pages.length;
        links = document.querySelectorAll('[data-role="pagelink"]');
        numLinks = links.length;
        for (var i = 0; i < numLinks; i++) {
            links[i].addEventListener("click", app.handleNav, false);
        }
        //add the listener for pageshow to each page
        for (var p = 0; p < numPages; p++) {
            pages[p].addEventListener("pageShow", app.handlePageShow, false);
        }
        app.loadPage(null);
        app.showimg_text();

    },

    //load page according to tap.

    handleNav: function (ev) {
        ev.preventDefault();
        var href = ev.target.href;
        var parts = href.split("#");
        app.loadPage(parts[1]);
        return false;
    },

    handlePageShow: function (ev) {
        ev.target.className = "active";
    },

    //check which page is called by default home-page is called.

    loadPage: function (url) {
        if (url == null) {
            //home page first call
            pages[0].className = 'active';
            history.replaceState(null, null, "#home");
            app.takephoto();

        } else {
            for (var i = 0; i < numPages; i++) {
                pages[i].className = "hidden";
                //get rid of all the hidden classes
                //but make them display block to enable anim.
                if (pages[i].id == url) {
                    pages[i].className = "show";
                    //add active to the proper page
                    history.pushState(null, null, "#" + url);
                    setTimeout(app.addDispatch, 50, i);
                }
            }
            //set the activetab class on the nav menu
            for (var t = 0; t < numLinks; t++) {
                links[t].className = "";
                if (links[t].href == location.href) {
                    links[t].className = "activetab";
                }
            }
        }
        //called respective function according to page load.
        if (url == "home") {
            app.takephoto();
            app.showimg_text();

        } else if (url == "stuff") {

            app.listthumbnail();
        }
    },


    addDispatch: function (num) {
        pages[num].dispatchEvent(pageshow);
    },

    //handle touch
    detectTouchSupport: function () {
        msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
        var touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
        return touchSupport;
    },

    touchHandler: function (ev) {
        //this function will run when the touch events happen
        if (ev.type == "touchend") {
            ev.preventDefault();
            var touch = evt.changedTouches[0]; //this is the first object touched

            var newEvt = document.createEvent("MouseEvent"); //old method works across browsers, though it is deprecated.

            newEvt.initMouseEvent("click", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY);
            //var newEvt = new MouseEvent("click");				//new method
            //REF: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.MouseEvent
            ev.currentTarget.dispatchEvent(newEvt);
            //change the touchend event into a click event and dispatch it immediately
            //this will skip the built-in 300ms delay before the click is fired by the browser
        }
    },

    //Add image.
    showimg_text: function (fileURI) {
        i = document.createElement("img");
        c = document.getElementById('c');
        //good idea to set the size of the canvas in Javascript in addition to CSS
        c.height = 400;
        c.width = 400;
        context = c.getContext('2d');
        i.addEventListener("load", function (ev) {

            var imgWidth = ev.currentTarget.width;
            var imgHeight = ev.currentTarget.height;
            var aspectRatio = imgWidth / imgHeight;
            ev.currentTarget.height = c.height;
            ev.currentTarget.width = c.height * aspectRatio;
            var w = i.width;
            var h = i.height;
            console.log("width: ", w, " height: ", h, " aspect ratio: ", aspectRatio);
            c.width = w;
            c.style.width = w + "px";
            context.drawImage(i, 0, 0, w, h);

        });
        i.crossOrigin = "Anonymous";
        i.src = fileURI;
        document.getElementById("b").addEventListener("click", app.addText);
        document.getElementById("b2").addEventListener("click", app.saveThumb);
    },

    //add caption on image.
    addText: function (ev) {
        var txt = document.getElementById("t").value;
        if (txt != "") {
            //clear the canvas
            context.clearRect(0, 0, c.w, c.h);
            //reload the image
            var w = i.width;
            var h = i.height;
            context.drawImage(i, 0, 0, w, h);
            //THEN add the new text to the image
            var middle = c.width / 2;
            var bottom = c.height - 20;

            var top = 50;
            context.font = "30px sans-serif";
            context.fillStyle = "red";
            context.strokeStyle = "gold";
            context.textAlign = "center";

            if (document.getElementById('top').checked) {
                context.fillText(txt, middle, top);
                context.strokeText(txt, middle, top);

            } else {
                context.fillText(txt, middle, bottom);
                context.strokeText(txt, middle, bottom);
            }
        }
    },

    //save image to database.
    saveThumb: function (ev) {
        var jpeg = c.toDataURL("image/jpeg", 1.0);
        //generate thumbnail and save it's output
        var imgWidth = i.width;
        var imgHeight = i.height;
        var aspectRatio = imgWidth / imgHeight;
        //now resize the image to our desired height
        var h = 200;
        var w = 200 * aspectRatio;

        i.height = h;
        i.width = h * aspectRatio;
        c.height = h;
        c.style.height = h + "px";
        c.width = w;
        c.style.width = w + "px";
        context.drawImage(i, 0, 0, w, h);

        var txt = document.getElementById("t").value;
        if (txt != "") {
            var middle = c.width / 2;
            var bottom = c.height - 20;
            var top = 20;
            context.font = "15px sans-serif";
            context.fillStyle = "red";
            context.strokeStyle = "gold";
            context.textAlign = "center";

            if (document.getElementById('top').checked) {
                context.fillText(txt, middle, top);
                context.strokeText(txt, middle, top);

            } else {
                context.fillText(txt, middle, bottom);
                context.strokeText(txt, middle, bottom);
            }
        }

        var thumbnail = c.toDataURL("image/jpeg", 1.0);
        jpeg = encodeURIComponent(jpeg);
        thumbnail = encodeURIComponent(thumbnail);

        //call savephp to store in database.
        app.savephp(thumbnail, jpeg);

    },

    //call savephp to store in database.
    savephp: function (thumbnail, jpeg) {
        //now do the ajax call then build your page
        //run on server
        //var deviceid = device.uuid;
        //app.sendRequest("http://faculty.edumedia.ca/griffis/mad9022/final-w15/save.php", app.callbacksave, postdata, "POST");

        //test locally    
        var deviceid = "123";
        var postdata = "dev=" + deviceid + "&img=" + jpeg + "&thumb=" + thumbnail;
        app.sendRequest("http://localhost:8888/final-w15/save.php", app.callbacksave, postdata, "POST");
    },

    callbacksave: function (data) {},

    //call database to get list of images.
    listthumbnail: function () {

        //this two line is used when work with online server.        
        //var deviceid = device.uuid;
        //app.sendRequest("http://faculty.edumedia.ca/griffis/mad9022/final-w15/list.php?dev=" + deviceid, app.showthumbnail, null, "GET");

        var deviceid = "123";
        app.sendRequest("http://localhost:8888/final-w15/list.php?dev=" + deviceid, app.showthumbnail, null, "GET");
    },

    //show thumbnail image from database.
    showthumbnail: function (data) {
        var json = JSON.parse(data["response"]);

        document.querySelector(".main_thumbails").innerHTML = "";
        for (var i = 0; i < json.thumnbails.length; i++) {
            var img_id = json.thumnbails[i].id;
            var main_div = document.createElement("div");
            main_div.setAttribute("class", "mainclassthumbnail");
            main_div.setAttribute("id", "thumbails" + i);
            document.querySelector(".main_thumbails").appendChild(main_div);
            var img = document.createElement("img");
            img.setAttribute("id", img_id);
            img.setAttribute("class", "imgtag");
            document.getElementById("thumbails" + i).appendChild(img);
            app.addHammer(img);
            var data = json.thumnbails[i].data;

            img.setAttribute("src", data);

            var del = document.createElement("input");
            del.setAttribute("type", "button");
            del.setAttribute("class", "pure-button pure-button-primary deletebtn");

            del.value = "Delete";
            var delete_id = json.thumnbails[i].id;

            del.setAttribute("id", delete_id);
            document.getElementById("thumbails" + i).appendChild(del);

            app.addHammerdelete(del);
        }
    },

    //use hammerjs to delete image.
    addHammerdelete: function (element) {

        // Add Hammer double tap event
        var mc = new Hammer.Manager(element);
        // Single tap recognizer
        mc.add(new Hammer.Tap({
            event: 'singletap'
        }));
        mc.on("singletap", function (ev) {
            app.deleteImage(ev.target.id);

        });
    },

    //open the dialogue to conform delete image
    deleteImage: function (imageId) {
        var div = document.createElement("div");
        var p = document.createElement("p");
        p.innerHTML = "Delete this photo?";
        div.setAttribute("id", "dialog");
        div.setAttribute("title", "Delete");
        div.appendChild(p);
        document.querySelector("body").appendChild(div);


        $("#dialog").dialog({
            modal: true,
            resizable: false,
            width: 500,
            maxHeight: 400,
            show: 'fade',
            hide: 'fade',
            dialogClass: 'main-dialog-class',
            buttons: {
                "Yes": function () {
                    $(this).dialog("close");


                    app.deleatethumbnail(imageId);
                    document.querySelector("#dialog").remove();

                },
                "No": function () {
                    $(this).dialog("close");
                    document.querySelector("#dialog").remove();
                }
            }
        });
    },

    //delete from databse
    deleatethumbnail: function (delete_id) {
        var deviceid = "123";
        app.sendRequest("http://localhost:8888/final-w15/delete.php?dev=" + deviceid + "&img_id=" + delete_id, app.show_deleate_thumbnail, null, "GET");
    },
    show_deleate_thumbnail: function (data) {

        app.listthumbnail();
    },

    //single tap to open image in full-screen.
    addHammer: function (element) {

        // Add Hammer double tap event
        var mc = new Hammer.Manager(element);
        mc.add(new Hammer.Tap({
            event: 'singletap'
        }));

        mc.on("singletap", function (ev) {

            app.showfullimage(ev.target.id);

        });
    },

    //this function will show full image
    showfullimage: function (target_img) {
        //var deviceid = device.uuid;
        var deviceid = "123";
        app.sendRequest("http://localhost:8888/final-w15/get.php?dev=" + deviceid + "&img_id=" + target_img, app.showbigimage, null, "GET");
    },

    //set full screen image.
    showbigimage: function (data) {

        var json = JSON.parse(data["response"]);
        var data = json.data;

        document.querySelector(".showfull_image").innerHTML = "";
        document.querySelector(".showfull_image").style.display = "block";
        document.querySelector(".main_thumbails").style.display = "none";
        var main_div = document.createElement("div");
        main_div.setAttribute("id", "full_image");
        document.querySelector(".showfull_image").appendChild(main_div);
        var img = document.createElement("img");

        img.setAttribute("src", data);
        img.setAttribute("class", "full_img");
        document.getElementById("full_image").appendChild(img);

        var close = document.createElement("input");
        close.setAttribute("type", "button");
        close.setAttribute("class", "pure-button pure-button-primary");
        close.value = "Close";
        close.setAttribute("id", "close");
        document.getElementById("full_image").appendChild(close);

        document.getElementById("close").addEventListener("click", app.close);

    },
    //close full screen image.
    close: function () {
        document.querySelector(".main_thumbails").style.display = "block";
        document.querySelector(".showfull_image").style.display = "none";
    },


    //this is for connection with php file
    createAJAXObj: function () {
        'use strict';
        try {
            return new XMLHttpRequest();
        } catch (er1) {
            try {
                return new ActiveXObject("Msxml3.XMLHTTP");
            } catch (er2) {
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
                } catch (er3) {
                    try {
                        return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                    } catch (er4) {
                        try {
                            return new ActiveXObject("Msxml2.XMLHTTP");
                        } catch (er5) {
                            try {
                                return new ActiveXObject("Microsoft.XMLHTTP");
                            } catch (er6) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    },

    sendRequest: function (url, callback, postData, type) {
        'use strict';
        var req = app.createAJAXObj(),
            method = type //(postData) ? "POST" : "GET";
        if (!req) {
            return;
        }
        req.open(method, url, true);

        if (postData) {
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        req.onreadystatechange = function () {
            if (req.readyState !== 4) {
                return;
            }
            if (req.status !== 200 && req.status !== 304) {
                return;
            }
            callback(req);
        }
        req.send(postData);
    },

    //This function will used to take picture with cordova-plugin of camera.
    takephoto: function () {


        var params = {
            quality: 75,

            destinationType: Camera.DestinationType.FILE_URI,

            sourceType: Camera.PictureSourceType.CAMERA,

            encodingType: Camera.EncodingType.JPEG,

            mediaType: Camera.MediaType.PICTURE,

            cameraDirection: Camera.Direction.FRONT,

            saveToPhotoAlbum: false
        };
        navigator.camera.getPicture(app.imgSuccess, app.imgFail, params);

    },

    imgSuccess: function (fileURI) {
        app.showimg_text(fileURI);
    },

    imgFail: function (message) {
        alert('Failed because: ' + message);
    }
}

app.init();