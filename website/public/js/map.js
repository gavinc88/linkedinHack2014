// Main page of items view
var MapView = Parse.View.extend({
  el: '.page',
  render: function() {
    var template = _.template($('#map-template').html(), {});
    this.$el.html(template);
    var map;
    google.maps.event.addDomListener(window, 'load', loadMap);
  }
});

var mapCenter = new google.maps.LatLng(37.386052, -122.083851);
//The degree to which the map is zoomed in. This can range from 0 (least zoomed) to 21 and above (most zoomed).
var mapZoom = 10;
//The max and min zoom levels that are allowed.
var mapZoomMax = 15;
var mapZoomMin = 6;

//These options configure the setup of the map.
var mapOptions = {
  center: mapCenter,
  zoom: mapZoom,
  //The type of map. In addition to ROADMAP, the other 'premade' map styles are SATELLITE, TERRAIN and HYBRID.
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  maxZoom:mapZoomMax,
  minZoom:mapZoomMin,
  //Turn off the map controls as we will be adding our own later.
  panControl: false,
  mapTypeControl: false
};

function loadMap() {
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  loadMapMarkers();
}

function loadMapMarkers () {
  var markerPosition = new google.maps.LatLng(37.386052, -122.083851);
  var markerIcon = {
    url: 'images/icon_green2.png',
    //The size image file.
    scaledSize: new google.maps.Size(200, 150),
    //The point on the image to measure the anchor from. 0, 0 is the top left.
    origin: new google.maps.Point(0, 0),
    //The x y coordinates of the anchor point on the marker. e.g. If your map marker was a drawing pin then the anchor would be the tip of the pin.
    anchor: new google.maps.Point(200, 150)
  };

  //Setting the shape to be used with the Glastonbury map marker.
  var markerShape = {
    coord: [12, 4, 216, 22, 212, 74, 157, 70, 184, 111, 125, 67, 6, 56],
    type: 'poly'
  };

  //Creating the Glastonbury map marker.
  marker = new google.maps.Marker({
    //uses the position set above.
    position: markerPosition,
    //adds the marker to the map.
    map: map,
    title: 'Puerto Vallerata',
    //assigns the icon image set above to the marker.
    icon: markerIcon,
    //assigns the icon shape set above to the marker.
    shape: markerShape,
    //sets the z-index of the map marker.
    zIndex: 102
  });
}

var mapView = new MapView();