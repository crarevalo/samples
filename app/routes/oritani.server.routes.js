var users = require("../../app/controllers/users.server.controller");
var oritani = require("../../app/controllers/oritani.server.controller");

module.exports = function(app){
  app.route("/oritani").get(users.requiresLogin, users.hasAuthorization, oritani.renderVideos);
  app.route("/oritani/data").get(users.requiresLogin, users.hasAuthorization, oritani.getData);
};
