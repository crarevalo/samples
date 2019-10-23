var users = require("../../app/controllers/users.server.controller");
var mimeo = require("../../app/controllers/mimeo.server.controller");

module.exports = function(app){
  app.route("/mimeo").get(users.requiresLogin, users.hasAuthorization, mimeo.renderScans).post(users.requiresLogin, users.hasAuthorization, mimeo.renderScans);
  app.route("/mimeo/ungrouped").get(users.requiresLogin, users.hasAuthorization, mimeo.renderUngrouped);
  app.route("/mimeo/grouping").get(users.requiresLogin, users.hasAuthorization, mimeo.renderGroupings);
  app.route("/mimeo/grouping/create").post(users.requiresLogin, users.hasAuthorization, mimeo.createGrouping);
  app.route("/mimeo/grouping/delete").post(users.requiresLogin, users.hasAuthorization, mimeo.deleteGrouping);
  app.route("/mimeo/grouping/modify").post(users.requiresLogin, users.hasAuthorization, mimeo.modifyGrouping);
  app.route("/mimeo/grouping/:groupingId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, mimeo.renderGrouping);
  app.route("/mimeo/grouping/:groupingId([0-9]+)/add/:scanId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, mimeo.addScan);
  app.route("/mimeo/grouping/:groupingId([0-9]+)/remove/:scanId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, mimeo.removeScan);
  app.route("/mimeo/grouping/:groupingId([0-9]+)/cover/:scanId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, mimeo.setGroupingCover);
  app.route("/mimeo/download/:scanId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, mimeo.downloadScan);
  app.route("/mimeo/scans").get(users.requiresLogin, users.hasAuthorization, mimeo.displayScan);
  app.route("/mimeo/rotate/:scanId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, mimeo.rotateScan);
};
