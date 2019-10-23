var users = require("../../app/controllers/users.server.controller");
var deltaic = require("../../app/controllers/deltaic.server.controller");

module.exports = function(app){
  app.route("/deltaic").get(users.requiresLogin, users.hasAuthorization, deltaic.renderSearch);
  app.route("/deltaic/:unionId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, deltaic.renderTree);
  app.route("/deltaic/data").get(users.requiresLogin, users.hasAuthorization, deltaic.loadData);
  app.route("/deltaic/tree").get(users.requiresLogin, users.hasAuthorization, deltaic.loadTree);
};
