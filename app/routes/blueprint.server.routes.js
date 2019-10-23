var users = require("../../app/controllers/users.server.controller");
var blueprint = require("../../app/controllers/blueprint.server.controller");

module.exports = function(app){
  app.route("/blueprint").get(users.requiresLogin, users.hasAuthorization, blueprint.renderPhotos).post(users.requiresLogin, users.hasAuthorization, blueprint.renderPhotos);
  app.route("/blueprint/download/:photoId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, blueprint.downloadPhoto);
  app.route("/blueprint/photos").get(users.requiresLogin, users.hasAuthorization, blueprint.displayPhoto);
  app.route("/blueprint/exif").get(users.requiresLogin, users.hasAuthorization, blueprint.displayEXIF);
};
