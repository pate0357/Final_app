//var app = {
//    // Application Constructor
//    initialize: function () {
//        this.bindEvents();
//    },
//    // Bind Event Listeners
//    //
//    // Bind any events that are required on startup. Common events are:
//    // 'load', 'deviceready', 'offline', and 'online'.
//    bindEvents: function () {
//        document.addEventListener('deviceready', this.onDeviceReady, false);
//    },
//    // deviceready Event Handler
//    //
//    // The scope of 'this' is the event. In order to call the 'receivedEvent'
//    // function, we must explicitly call 'app.receivedEvent(...);'
//    onDeviceReady: function () {
//        app.receivedEvent('deviceready');
//    },
//    // Update DOM on a Received Event
//    receivedEvent: function (id) {
//        var parentElement = document.getElementById(id);
//        var listeningElement = parentElement.querySelector('.listening');
//        var receivedElement = parentElement.querySelector('.received');
//
//        listeningElement.setAttribute('style', 'display:none;');
//        receivedElement.setAttribute('style', 'display:block;');
//
//        console.log('Received Event: ' + id);
//    }
//};
//
//app.initialize();


// JavaScript Document
var pages = [], links = [];
var numLinks = 0;
var numPages = 0;
var pageTime = 800;//same as CSS transition
var preURL="home";

//create the pageShow type event.
var pageshow = document.createEvent("CustomEvent");
pageshow.initEvent("pageShow", false, true);

//deviceready DOMContentLoaded
document.addEventListener("DOMContentLoaded", function(){
	//device ready listener
    
	pages = document.querySelectorAll('[data-role="page"]');	
	numPages = pages.length;
	links = document.querySelectorAll('[data-role="pagelink"]');
	numLinks = links.length;
	for(var i=0;i<numLinks; i++){
		links[i].addEventListener("click", handleNav, false);	
	}
  //add the listener for pageshow to each page
  for(var p=0; p < numPages; p++){
    pages[p].addEventListener("pageShow", handlePageShow, false);
  }
	loadPage(null);
});

function handleNav(ev){
	ev.preventDefault();
	var href = ev.target.href;
	var parts = href.split("#");
	loadPage( parts[1] );	
  return false;
}

function handlePageShow(ev){
  ev.target.className = "active";
}

function loadPage( url ){
	if(url == null){
		//home page first call
		pages[0].className = 'active';
		history.replaceState(null, null, "#home");	
	}else{
    for(var i=0; i < numPages; i++){
      pages[i].className = "hidden";
      //get rid of all the hidden classes
      //but make them display block to enable anim.
      if(pages[i].id == url){
        pages[i].className = "show";
        //add active to the proper page
        history.pushState(null, null, "#" + url);
        setTimeout(addDispatch, 50, i);
      }
    }
    //set the activetab class on the nav menu
    for(var t=0; t < numLinks; t++){
      links[t].className = "";
      if(links[t].href == location.href){
        links[t].className = "activetab";
      }
    }
	}
//    if(!preURL==url)
//    {
    if(url=="stuff")
    {
        getlocation();
    }
    
     else if(url=="other")
    {
        getContacts();
    }
//}
}
function addDispatch(num){
  pages[num].dispatchEvent(pageshow);
  //num is the value i from the setTimeout call
  //using the value here is creating a closure
}


function detectTouchSupport( ){
  msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
  var touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
  return touchSupport;
}
	
function touchHandler(ev){
  //this function will run when the touch events happen
  if( ev.type == "touchend"){
    ev.preventDefault();
    var touch = evt.changedTouches[0];        //this is the first object touched
    
    var newEvt = document.createEvent("MouseEvent");	//old method works across browsers, though it is deprecated.
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
}

//var myElement = document.getElementById('stuff');
// 
//var mc = new Hammer(myElement);
//// create a simple instance
//// by default, it only adds horizontal recognizers
//mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
//
//// listen to events...
//mc.on("panright ", function(ev) {
//    loadPage(stuff);
////    myElement.textContent = ev.type +" gesture detected.";
//});