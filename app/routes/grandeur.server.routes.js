var users = require("../../app/controllers/users.server.controller");
var grandeur = require("../../app/controllers/grandeur.server.controller");

module.exports = function(app){
  app.route("/grandeur/receipts").get(users.requiresLogin, users.hasAuthorization, grandeur.renderReceipts);
  app.route("/grandeur/receipts/data").get(users.requiresLogin, users.hasAuthorization, grandeur.getReceiptsJSON);
  app.route("/grandeur/receipts/receipt").get(users.requiresLogin, users.hasAuthorization, grandeur.getFileData);
  app.route("/grandeur/receipts/create").post(users.requiresLogin, users.hasAuthorization, grandeur.createReceipt);
  app.route("/grandeur/receipts/update").post(users.requiresLogin, users.hasAuthorization, grandeur.updateReceipt);
  app.route("/grandeur/receipts/upload").post(users.requiresLogin, users.hasAuthorization, grandeur.uploadFile);
  app.route("/grandeur/markets").get(users.requiresLogin, users.hasAuthorization, grandeur.renderMarkets);
};
