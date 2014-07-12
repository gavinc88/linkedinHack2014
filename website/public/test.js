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
			router.navigate('', {trigger: true});
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

// Main page of items view
var MapView = Parse.View.extend({
	el: '.page',
	render: function() {
		var template = _.template($('#map-template').html(), {});
		this.$el.html(template);
	}
});

var mapView = new MapView();

var Router = Parse.Router.extend({
	routes: {
	   	"": "home",
	   	"edit/:id": "post",
	  	"post": "post",
		"login" : "login",
		"viewItem/:id" : "viewItem",
		"items" : "viewMyItems"
   }
});

var router = new Router();
router.on("route:home", function() {
	mapView.render();
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

Parse.history.start();
