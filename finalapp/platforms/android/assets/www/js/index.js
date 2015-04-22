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
        //		if(app.loadRequirements === 2){
        app.start();
        //		}
    },
    start: function () {

        app.pageshowevent();

    },

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
        //    if(!preURL==url)
        //    {
        if (url == "home") {
            app.takephoto();
            app.showimg_text();

        } else if (url == "stuff") {

            app.listthumbnail();

            //            document.querySelector(".main_thumbails").innerHTML = "";
        }
        //}
    },

    addDispatch: function (num) {
        pages[num].dispatchEvent(pageshow);
        //num is the value i from the setTimeout call
        //using the value here is creating a closure
    },


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
            /**
            event.initMouseEvent(type, canBubble, cancelable, view,
                             detail, screenX, screenY, clientX, clientY,
                             ctrlKey, altKey, shiftKey, metaKey,
                             button, relatedTarget); **/
            newEvt.initMouseEvent("click", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY);
            //var newEvt = new MouseEvent("click");				//new method
            //REF: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.MouseEvent
            ev.currentTarget.dispatchEvent(newEvt);
            //change the touchend event into a click event and dispatch it immediately
            //this will skip the built-in 300ms delay before the click is fired by the browser
        }
    },

    showimg_text: function (fileURI) {


        i = document.createElement("img");

        c = document.getElementById('c');
        //good idea to set the size of the canvas in Javascript in addition to CSS
        c.height = 400;
        c.width = 400;
        context = c.getContext('2d');
        i.addEventListener("load", function (ev) {
            //load to canvas after the image is loaded
            //in this sample the original is 300px x 430px
            //we want to resize it to fill the height of our canvas - 600px;

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
            //drawImage(image, x-position, y-position, width, height)
        });
        i.crossOrigin = "Anonymous";
        //the crossOrigin property will let you use images from different domains IF the SERVER allows it
        //and if you are using Chrome or Firefox
        //https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
        //        i.src = "./img/marvel-mighty-muggs-wave-3-ghost-rider-300x300.jpg";
        //        i.src = "http://www.airbus.com/typo3temp/pics/81efc5ab0e.jpg";
        i.src = fileURI;

        document.getElementById("b").addEventListener("click", app.addText);
        //        document.getElementById("b1").addEventListener("click", function () {
        //            app.saveImg();
        //            //            app.saveThumb();
        //        });    
        document.getElementById("b2").addEventListener("click", app.saveThumb);

    },

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
            //            context.fillText(txt, middle, bottom);
            //            context.strokeText(txt, middle, bottom);

            if (document.getElementById('top').checked) {
                context.fillText(txt, middle, top);
                context.strokeText(txt, middle, top);

            } else {
                context.fillText(txt, middle, bottom);
                context.strokeText(txt, middle, bottom);
            }
        }
    },

    saveThumb: function (ev) {
        var jpeg = c.toDataURL("image/jpeg", 1.0);
        //generate thumbnail and save it's output
        //i is the loaded image.
        //we can resize it and then repeat the loading code to scale the canvas to match
        //then extract the whole canvas
        var imgWidth = i.width;
        var imgHeight = i.height;
        var aspectRatio = imgWidth / imgHeight;
        console.log("width: ", imgWidth, " height: ", imgHeight, " aspect ratio: ", aspectRatio);
        //now resize the image to our desired height
        var h = 200;
        var w = 200 * aspectRatio;
        console.log("width: ", w, " height: ", h, " aspect ratio: ", aspectRatio);
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
            //            context.fillText(txt, middle, bottom);
            //            context.strokeText(txt, middle, bottom);

            if (document.getElementById('top').checked) {
                context.fillText(txt, middle, top);
                context.strokeText(txt, middle, top);

            } else {
                context.fillText(txt, middle, bottom);
                context.strokeText(txt, middle, bottom);
            }
        }


        var thumbnail = c.toDataURL("image/jpeg", 1.0);
        //        document.getElementById("thumbnail").innerHTML = thumbnail;
        jpeg = encodeURIComponent(jpeg);
        thumbnail = encodeURIComponent(thumbnail);

        app.savephp(thumbnail, jpeg);

    },

    savephp: function (thumbnail, jpeg) {
        //now do the ajax call then build your page

        var deviceid = device.uuid;

        var postdata = "dev=" + deviceid + "&img=" + jpeg + "&thumb=" + thumbnail;
        app.sendRequest("http://faculty.edumedia.ca/griffis/mad9022/final-w15/save.php", app.callbacksave, postdata, "POST");

    },

    callbacksave: function (data) {

    },

    listthumbnail: function () {

        var deviceid = device.uuid;
        app.sendRequest("http://faculty.edumedia.ca/griffis/mad9022/final-w15/list.php?dev=" + deviceid, app.showthumbnail, null, "GET");
    },

    showthumbnail: function (data) {
        var json = JSON.parse(data["response"]);
        console.log(json);
        console.log(json.thumbnails);

        document.querySelector(".main_thumbails").innerHTML = "";
        for (var i = 0; i < json.thumbnails.length; i++) {
            var img_id = json.thumbnails[i].id;
            var main_div = document.createElement("div");
            main_div.setAttribute("class", "mainclassthumbnail");
            main_div.setAttribute("id", "thumbails" + i);
            document.querySelector(".main_thumbails").appendChild(main_div);
            var img = document.createElement("img");
            img.setAttribute("id", img_id);
            img.setAttribute("class", "imgtag");
            document.getElementById("thumbails" + i).appendChild(img);
            //            document.getElementById(img_id).addEventListener("click", app.showfullimage);
            app.addHammer(img);
            var data = json.thumbnails[i].data;
            //            console.log(data);
            img.setAttribute("src", data);

            var del = document.createElement("input");
            del.setAttribute("type", "button");
            del.setAttribute("class", "pure-button pure-button-primary deletebtn");

            del.value = "DELETE";
            var delete_id = json.thumbnails[i].id;
            console.log(delete_id);
            del.setAttribute("id", delete_id);
            document.getElementById("thumbails" + i).appendChild(del);
            //                document.getElementById(delete_id).addEventListener("click", app.deleatethumbnail);
            //            console.log(document.getElementById(delete_id));
            app.addHammerdelete(del);

        }

    },

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

                    //Get device id
                    //                    var devId = device.uuid;
                    //                    var devId = "1232341";
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




    // if user click on that then it gives image_id.
    deleatethumbnail: function (delete_id) {

        var deviceid = device.uuid;
        console.log(delete_id);
        //        var delete_id = ev.currentTarget.id;
        console.log(delete_id);
        //        var deviceid = "123";
        //        var postdata = "dev=" + deviceid + "&img_id=" + delete_id;
        app.sendRequest("http://faculty.edumedia.ca/griffis/mad9022/final-w15/delete.php?dev=" + deviceid + "&img_id=" + delete_id, app.show_deleate_thumbnail, null, "GET");
    },

    show_deleate_thumbnail: function (data) {
        //        alert(JSON.stringify(data));
        app.listthumbnail();
    },


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
        var deviceid = device.uuid;
        console.log(target_img);
        //        console.log(img_id);
        //        var deviceid = "123";

        app.sendRequest("http://faculty.edumedia.ca/griffis/mad9022/final-w15/get.php?dev=" + deviceid + "&img_id=" + target_img, app.showbigimage, null, "GET");
    },

    showbigimage: function (data) {
        //        alert(JSON.stringify(data));
        var json = JSON.parse(data["response"]);
        console.log(json.data);
        var data = json.data;
        //        console.log(json.id);
        document.querySelector(".showfull_image").innerHTML = "";
        document.querySelector(".showfull_image").style.display = "block";
        document.querySelector(".main_thumbails").style.display = "none";
        var main_div = document.createElement("div");
        main_div.setAttribute("id", "full_image");
        document.querySelector(".showfull_image").appendChild(main_div);
        var img = document.createElement("img");
        //        img.setAttribute("id", img_id);
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

    close: function () {
        document.querySelector(".main_thumbails").style.display = "block";
        document.querySelector(".showfull_image").style.display = "none";
    },


    //    get_thumbnail_img: function () {
    //
    //        var deviceid = "123";
    //
    //        $.ajax({
    //            url: "http://localhost:8888/final-w15/list.php",
    //            type: "GET",
    //            dataType: "jsonp",
    //
    //            //            jsonp: false,
    //            data: ({
    //                dev: deviceid
    //            }),
    //            success: function (data) {
    //                alert(data);
    //            }
    //        }).done(function (dataresponseText) {
    //            console.log(dataresponseText.thumbnails[0].id);
    //
    //        });
    //    },

    //    delete_image: function () {},
    //    showfull_image: function () {}




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
        //req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
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



    //This function will used to take picture
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
        //        var image = document.getElementById("myImage");
        //        image.src = fileURI;
        //        //        alert("hi2");
        //        var maindiv = document.querySelector(".takeimg");
        //
        //        //create canvas element
        //        var createcanvas = document.createElement("canvas");
        //        createcanvas.id = "myCanvas";
        //        createcanvas.width = "400";
        //        createcanvas.height = "400";
        //        maindiv.appendChild(createcanvas);
        //
        //
        //
        //        //append image tag to canvas
        //        var canvas = document.querySelector("#myCanvas");
        //        var context = canvas.getContext('2d');
        //        var img = document.createElement("img");
        //
        //        img.onload = function () {
        //            context.drawImage(img, 0, 0);
        //        };
        app.showimg_text(fileURI);

        //        img.src = fileURI;
    },
    imgFail: function (message) {
        alert('Failed because: ' + message);
    }
}

app.init();