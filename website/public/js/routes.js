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
