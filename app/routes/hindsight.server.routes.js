var users = require("../../app/controllers/users.server.controller");
var hindsight = require("../../app/controllers/hindsight.server.controller");

module.exports = function(app){
  app.route("/hindsight/locations").get(users.requiresLogin, users.hasAuthorization, hindsight.renderLocations).post(users.requiresLogin, users.hasAuthorization, hindsight.renderLocations);
  app.route("/hindsight/notes").get(users.requiresLogin, users.hasAuthorization, hindsight.renderNotes).post(users.requiresLogin, users.hasAuthorization, hindsight.renderNotes);
  app.route("/hindsight/note/edit").post(users.requiresLogin, users.hasAuthorization, hindsight.editNote);
  app.route("/hindsight/texts").get(users.requiresLogin, users.hasAuthorization, hindsight.renderTexts).post(users.requiresLogin, users.hasAuthorization, hindsight.renderTexts);
  app.route("/hindsight/logs").get(users.requiresLogin, users.hasAuthorization, hindsight.renderLogs).post(users.requiresLogin, users.hasAuthorization, hindsight.renderLogs);
  app.route("/hindsight/log").get(users.requiresLogin, users.hasAuthorization, hindsight.displayLog);
  app.route("/hindsight/emails").get(users.requiresLogin, users.hasAuthorization, hindsight.renderEmails).post(users.requiresLogin, users.hasAuthorization, hindsight.renderEmails);
//  app.route("/hindsight/email").get(users.requiresLogin, users.hasAuthorization, hindsight.displayEmail);
  app.route("/hindsight/service/notes").post(users.requiresToken, hindsight.serviceNotePOST);
  app.route("/hindsight/service/locations").post(users.requiresToken, hindsight.serviceLocationPOST);
};
