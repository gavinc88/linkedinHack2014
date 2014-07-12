Parse.$ = jQuery;
Parse.initialize("VWkjUjyYiGFBJ9XxJ7okPISEA1zPvjc1at7En7gu", "lACzOtQsYDbEncj0xJjXzU0H5oyJa5gMZIV2LBQC");

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function logout() {
    Parse.User.logOut();
}

//signUp("test", "test", "test@test.com");
var Item = Parse.Object.extend({
    className: "Items"
});

var Items = Parse.Collection.extend({
    model: Item
});

//Header view
var HeaderView = Parse.View.extend({
    el: '.header',
    render: function(user) {
        var username = user ? user.get("username") : null;
        var template = _.template($('#header-template').html(), {user: user, username: username});
        this.$el.html(template);
    }
});

var headerView = new HeaderView();

headerView.render(Parse.User.current());

//Viewing a single item view
var ItemView = Parse.View.extend({
    el: '.page',
    events: {
        'click .edit-item-button': 'editItem',
        'click .delete-item-button': 'deleteItem'
    },
    editItem: function() {
        var id = $('#view-item-id').val();
        var query = new Parse.Query(Item);
        query.get(id, {
            success: function(item) {
                postItemView.render(item);
            }
        });
    },
    deleteItem: function() {
        if(confirm("Are you sure you want to delete this item?")) {
            var id = $('#view-item-id').val();
            var query = new Parse.Query(Item);
            query.get(id, {
                success: function(item) {
                    item.destroy();
                    router.navigate('', {trigger:true});
                }
            });
        }
    },
    render: function(id) {
        var that = this;
        var item = new Item({id: id});
        item.fetch({
            success:function(item) {
                var seller = item.get("seller");
                seller.fetch({
                    success:function(user) {
                        var template = _.template($('#view-item-template').html(), {item: item, seller: user});
                        that.$el.html(template);
                    }
                });
            },
            error:function(item, error) {
                that.$el.html("<p>This item no longer exists.</p>");
            }
        });
    }
});

var itemView = new ItemView();

// Main page of items view
var ItemsListView = Parse.View.extend({
    el: '.page',
    render: function() {
        var that = this;
        var query = new Parse.Query(Item);
        query.descending("updatedAt");
        query.limit(50);
        var items = query.collection();
        //var items = new Items({query: query});
        items.fetch({
            success: function(items) {
                var template = _.template($('#items-list-template').html(), {items: items.models});
                that.$el.html(template);
            }
        });
    }
});

var itemsListView = new ItemsListView();

// View for viewing your own items
var MyItemsView = Parse.View.extend({
    el: '.page',
    render: function() {
        var that = this;
        var query = new Parse.Query(Item);
        query.descending("updatedAt");
        query.equalTo("seller", Parse.User.current());
        var items = query.collection();
        //var items = new Items({query: query});
        items.fetch({
            success: function(items) {
                var template = _.template($('#items-list-template').html(), {items: items.models});
                that.$el.html(template);
            }
        });
    }
});

var myItemsView = new MyItemsView();

//Logging in/signing up view
var LoginView = Parse.View.extend({
    el: '.page',
    events: {
        'click .login-button': 'login',
        'click .signup-button': 'signUp'
    },
    login: function(ev) {
        var username = $('#login-username').val();
        var password = $('#login-password').val();
        Parse.User.logIn(username, password, {
            success: function(user) {
                headerView.render(user);
                router.navigate('', {trigger: true});
            },
            error: function(user, error) {
                alert("Invalid username or password");
            }
        });
    },
    signUp: function(ev) {
        var username = $('#signup-username').val();
        var email = $('#signup-email').val();
        var password = $('#signup-password').val();
        var password2 = $('#signup-password2').val();
        if(!username || !email || !password || !password2) {
            alert("You must fill in all fields to sign up.");
            return;
        } else if(password !== password2) {
            alert("Passwords do not match.");
            return;
        }
        var user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        user.set("email", email);
        user.signUp(null, {
            success: function(user) {
                currentUser = user;
                alert("Successfully signed up.");
                router.navigate('', {trigger:true});
            },
            error: function(user, error) {
                alert(error.message);
            }
        });
    },
    render: function() {
        if(Parse.User.current()) {
            router.navigate('#/gavin', {trigger: true});
        } else {
            var template = _.template($('#login-template').html(), null);
            this.$el.html(template);
        }
    }
});

var loginView = new LoginView();

//Posting an item view
var PostItemView = Parse.View.extend({
    el: '.page',
    events: {
        'click .post-item-button': 'postItem',
        'click .edit-item-button': 'editItem'
    },
    postItem: function() {
        var title = $('#post-item-title').val();
        var price = Number($('#post-item-price').val());
        var description = $('#post-item-description').val();
        var fileUploadControl = $('#post-item-picture')[0];
        if(!title) {
            alert("You must specify an item name.");
            return;
        }
        if(fileUploadControl.files.length > 0) {
            var file = fileUploadControl.files[0];
            var name = "photo.jpg";

            var parseFile = new Parse.File(name, file);

            parseFile.save().then(function() {
                var item = new Item();
                item.set("title", title);
                item.set("price", price ? price : 0);
                item.set("description", description);
                item.set("seller", Parse.User.current());
                item.set("highBid", 0);
                item.set("sold", false);
                item.set("picture", parseFile);
                item.save(null, {
                    success: function(item) {
                        router.navigate('', {trigger:true});
                    },
                    error: function(item, error) {
                        alert("Failed to post item");
                    }
                });
            }, function(error) {
                alert("Failed to upload picture.");
            });
        } else {
            var item = new Item();
            item.set("title", title);
            item.set("price", price);
            item.set("description", description);
            item.set("seller", Parse.User.current());
            item.set("highBid", 0);
            item.set("sold", false);
            item.save(null, {
                success: function(item) {
                    router.navigate('', {trigger:true});
                },
                error: function(item, error) {
                    alert("Failed to post item");
                }
            });
        }
    },
    editItem: function() {
        var id = $('#edit-item-id').val();
        var query = new Parse.Query(Item);
        query.get(id, {
            success: function(item) {
                var title = $('#post-item-title').val();
                var price = Number($('#post-item-price').val());
                var description = $('#post-item-description').val();
                var fileUploadControl = $('#post-item-picture')[0];
                if(!title) {
                    alert("You must specify an item name.");
                    return;
                }
                if(fileUploadControl.files.length > 0) {
                    var file = fileUploadControl.files[0];
                    var name = "photo.jpg";

                    var parseFile = new Parse.File(name, file);

                    parseFile.save().then(function() {
                        item.set("title", title);
                        item.set("price", price ? price : 0);
                        item.set("description", description);
                        item.set("picture", parseFile);
                        item.save(null, {
                            success: function(item) {
                                //router.navigate('#/viewItem/'+id, {trigger:true});
                                Parse.history.loadUrl();
                            },
                            error: function(item, error) {
                                alert("Failed to post item");
                            }
                        });
                    }, function(error) {
                        alert("Failed to upload picture.");
                    });
                } else {
                    item.set("title", title);
                    item.set("price", price);
                    item.set("description", description);
                    item.save(null, {
                        success: function(item) {
                            Parse.history.loadUrl();
                            //router.navigate('#/viewItem/'+id, {trigger:true});
                        },
                        error: function(item, error) {
                            alert("Failed to post item");
                        }
                    });
                }
            }
        });

    },
    render: function(item) {
        if(Parse.User.current()) {
            var template = _.template($('#post-item-template').html(), {item: item});
            this.$el.html(template);
        } else {
            this.$el.html("<p>You must be logged in to post.</p>");
        }
    }
});

var postItemView = new PostItemView();


var GalleryViewGavin = Parse.View.extend({
  el: '.page',
  render: function() {
    var template = _.template($('#gallery-template-gavin').html(), null);
    this.$el.html(template);
  }
});

var galleryViewGavin = new GalleryViewGavin();

var GalleryViewMaggie = Parse.View.extend({
  el: '.page',
  render: function() {
    var template = _.template($('#gallery-template-maggie').html(), null);
    this.$el.html(template);
  }
});

var galleryViewMaggie = new GalleryViewMaggie();

var GalleryViewAll = Parse.View.extend({
  el: '.page',
  render: function() {
    var template = _.template($('#gallery-template-all').html(), null);
    this.$el.html(template);
  }
});

var galleryViewAll = new GalleryViewAll();

var MapView = Parse.View.extend({
    el: '.page',
    render: function(type) {
        var template = _.template($('#map-template').html(), {});
        this.$el.html(template);
        var map;
        if(type == "gavin")
            google.maps.event.addDomListener(window, 'load', loadGavinMap);
        else if(type == "maggie")
            google.maps.event.addDomListener(window, 'load', loadMaggieMap);
        else if(type == "all")
            google.maps.event.addDomListener(window, 'load', loadAllMap);
    }
});

const lat_ca = 37.3;
const lng_ca = -119.4;
const lat_ny = 44.019484;
const lng_ny = -81.716309;
const lat_us = 41.700602;
const lng_us = -81.265625;

function loadGavinMap(){
    console.log('loadGavinMap');
    var options = setupMapOptions(lat_ca, lng_ca, 6);
    loadMap(options, "gavin");
}

function loadMaggieMap(){
    console.log('loadMaggieMap');
    var options = setupMapOptions(lat_ny, lng_ny, 6);
    loadMap(options, "maggie");
}

function loadAllMap(){
    console.log('loadAllMap');
    var options = setupMapOptions(lat_us, lng_us, 6);
    loadMap(options, "all");
}

function setupMapOptions(lat, lng, z) {
    var mapOptions = {
        center : new google.maps.LatLng(lat, lng),
        zoom : z,
        maxZoom : 15,
        minZoom : 2,
        //Turn off the map controls as we will be adding our own later.
        panControl: false,
        mapTypeControl: false,
        mapTypeControlOptions: {
            mapTypeIds: [ 'map_styles']
        }
    }
    return mapOptions;
}

var style_json =
    [
        {
            "featureType": "landscape",
            "stylers": [
                { "color": "#C8DCA8" }
            ]
        },{
        "featureType": "water",
        "stylers": [
            { "color": "#436FCC" }
        ]
    },{
        "elementType": "geometry.stroke",
        "stylers": [
            { "color": "#ffffff" },
            { "weight": 2.3 }
        ]
    },{
        "featureType": "road",
        "stylers": [
            { "visibility": "off" }
        ]
    },{
    }
    ];

var styled_map = new google.maps.StyledMapType(style_json, {name: "map style"});

function loadMap(options, type) {
    console.log('loadMap ' + type);
    map = new google.maps.Map(document.getElementById("map"), options);
    map.mapTypes.set('map_styles', styled_map);
    map.setMapTypeId('map_styles');
    if(type == "gavin")
        loadGavinMarkers();
    else if(type == "maggie")
        loadMaggieMarkers();
    else if(type == "all")
        loadAllMarkers();
}

const lat_berkeley = 37.871593;
const lng_berkeley = -122.272747;
const lat_la = 34.052234;
const lng_la = -118.243685;
const lat_vegas = 36.169941;
const lng_vegas = -115.13983;

const lat_montreal = 45.50867;
const lng_montreal = -73.553992;
const lat_nyc = 40.712784;
const lng_nyc = -74.005941;
const lat_ithaca = 42.443961;
const lng_ithaca = -76.501881;
const lat_illinois = 40.633125;
const lng_illinois = -89.398528;
const lat_dc = 38.907192;
const lng_dc = -77.036871;

function loadGavinMarkers(){
  console.log('loadGavinMarkers');
  var berkeleyPosition = new google.maps.LatLng(lat_berkeley, lng_berkeley);
  var berkeleyIcon = {
    url: 'images/pin_norcal.png',
    scaledSize: new google.maps.Size(140, 200),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(70, 200)
  };
  berkeleyMarker = new google.maps.Marker({
    position: berkeleyPosition,
    map: map,
    title: 'berkeley',
    icon: berkeleyIcon,
    zIndex: 101
  });

  var laPosition = new google.maps.LatLng(lat_la, lng_la);
  var laIcon = {
    url: 'images/pin_socal.png',
    scaledSize: new google.maps.Size(80, 112),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(40, 112)
  };
  laMarker = new google.maps.Marker({
    position: laPosition,
    map: map,
    title: 'los angeles',
    icon: laIcon,
    zIndex: 102
  });

  var vegasPosition = new google.maps.LatLng(lat_vegas, lng_vegas);
  var vegasIcon = {
    url: 'images/pin_vegas.png',
    scaledSize: new google.maps.Size(80, 112),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(40, 112)
  };
  vegasMarker = new google.maps.Marker({
    position: vegasPosition,
    map: map,
    title: 'vegas',
    icon: vegasIcon,
    zIndex: 103
  });

  google.maps.event.addListener(berkeleyMarker, "click", function (e) {
    console.log("berkeleyMarker clicked");
    galleryViewGavin.render();
    this.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
  });

  google.maps.event.addListener(laMarker, "click", function (e) {
    console.log("laMarker clicked");
    galleryViewGavin.render();
    this.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
  });

  google.maps.event.addListener(vegasMarker, "click", function (e) {
    console.log("vegasMarker clicked");
    galleryViewGavin.render();
    this.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
  });
}

function loadMaggieMarkers(){
    console.log('loadMaggieMarkers');
    var nycPosition = new google.maps.LatLng(lat_nyc, lng_nyc);
    var nycIcon = {
        url: 'images/pin_nyc.png',
        scaledSize: new google.maps.Size(90, 126),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(45, 126)
    };
    nycMarker = new google.maps.Marker({
        position: nycPosition,
        map: map,
        title: 'new york city',
        icon: nycIcon,
        zIndex: 103
    });

    var montrealPosition = new google.maps.LatLng(lat_montreal, lng_montreal);
    var montrealIcon = {
        url: 'images/pin_montreal.png',
        scaledSize: new google.maps.Size(90, 126),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(45, 126)
    };
    montrealMarker = new google.maps.Marker({
        position: montrealPosition,
        map: map,
        title: 'montreal',
        icon: montrealIcon,
        zIndex: 102
    });

    var ithacaPosition = new google.maps.LatLng(lat_ithaca, lng_ithaca);
    var ithacaIcon = {
        url: 'images/pin_ithaca.png',
        scaledSize: new google.maps.Size(120, 172),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(60, 172)
    };
    ithacaMarker = new google.maps.Marker({
        position: ithacaPosition,
        map: map,
        title: 'ithaca',
        icon: ithacaIcon,
        zIndex: 101
    });

    var illinoisPosition = new google.maps.LatLng(lat_illinois, lng_illinois);
    var illinoisIcon = {
        url: 'images/pin_illinois.png',
        scaledSize: new google.maps.Size(66, 90),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(33, 90)
    };
    illinoisMarker = new google.maps.Marker({
        position: illinoisPosition,
        map: map,
        title: 'illinois',
        icon: illinoisIcon,
        zIndex: 104
    });

  google.maps.event.addListener(illinoisMarker, "click", function (e) {
    console.log("illinoisMarker clicked");
    galleryViewMaggie.render();
    this.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
  });
}

function loadAllMarkers(){
  console.log('loadAllMarkers');
  var nycPosition = new google.maps.LatLng(lat_nyc, lng_nyc);
  var nycIcon = {
    url: 'images/pin_combined_nyc.png',
    scaledSize: new google.maps.Size(190, 275),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(95, 275)
  };
  nycMarker = new google.maps.Marker({
    position: nycPosition,
    map: map,
    title: 'new york city',
    icon: nycIcon,
    zIndex: 101
  });

  var dcPosition = new google.maps.LatLng(lat_dc, lng_dc);
  var dcIcon = {
    url: 'images/pin_combined_washington_dc.png',
    scaledSize: new google.maps.Size(106, 146),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(53, 146)
  };
  dcMarker = new google.maps.Marker({
    position: dcPosition,
    map: map,
    title: 'montreal',
    icon: dcIcon,
    zIndex: 102
  });

  var illinoisPosition = new google.maps.LatLng(lat_illinois, lng_illinois);
  var illinoisIcon = {
    url: 'images/pin_illinois.png',
    scaledSize: new google.maps.Size(66, 90),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(33, 90)
  };
  illinoisMarker = new google.maps.Marker({
    position: illinoisPosition,
    map: map,
    title: 'illinois',
    icon: illinoisIcon,
    zIndex: 103
  });

  var berkeleyPosition = new google.maps.LatLng(lat_berkeley, lng_berkeley);
  var berkeleyIcon = {
    url: 'images/pin_norcal.png',
    scaledSize: new google.maps.Size(140, 200),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(70, 200)
  };
  berkeleyMarker = new google.maps.Marker({
    position: berkeleyPosition,
    map: map,
    title: 'berkeley',
    icon: berkeleyIcon,
    zIndex: 101
  });

  google.maps.event.addListener(nycMarker, "click", function (e) {
    console.log("nycCombinedMarker clicked");
    galleryViewAll.render();
    this.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
  });
}

var mapView = new MapView();

var Router = Parse.Router.extend({
    routes: {
        "": "home",
        "gavin" : "gavin",
        "maggie" : "maggie",
        "all" : "all",
        "edit/:id": "post",
        "post": "post",
        "login" : "login",
        "viewItem/:id" : "viewItem",
        "items" : "viewMyItems",
        "intro" : "intro"
    }
});

var router = new Router();
router.on("route:home", function() {
  loginView.render();
});

router.on("route:gavin", function() {
  mapView.render("gavin");
});

router.on("route:maggie", function() {
    mapView.render("maggie");
});

router.on("route:all", function() {
    mapView.render("all");
});

router.on("route:post", function() {
    postItemView.render(false);
});

router.on("route:login", function() {
    loginView.render();
});

router.on("route:viewItem", function(id) {
    itemView.render(id);
});

router.on("route:viewMyItems", function() {
    myItemsView.render();
});

router.on("route:intro", function() {

});

Parse.history.start();
