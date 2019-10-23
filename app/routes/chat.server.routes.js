var users = require("../../app/controllers/users.server.controller");
var chat = require("../../app/controllers/chat.server.controller");

module.exports = function(app){
  app.route("/chat").get(users.requiresLogin, users.hasAuthorization, chat.renderIndex);
};
