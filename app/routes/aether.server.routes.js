var users = require("../../app/controllers/users.server.controller");
var aether = require("../../app/controllers/aether.server.controller");

module.exports = function(app){
  app.route("/aether").get(users.requiresLogin, users.hasAuthorization, aether.renderIndex);
  app.route("/aether/artists").get(users.requiresLogin, users.hasAuthorization, aether.getArtists);
  app.route("/aether/artist/:artistId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, aether.getArtist);
  app.route("/aether/search").post(users.requiresLogin, users.hasAuthorization, aether.search);
  app.route("/aether/song/:songId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, aether.getSong);
};
