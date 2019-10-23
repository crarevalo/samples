var users = require("../../app/controllers/users.server.controller");
var crosscheck = require("../../app/controllers/crosscheck.server.controller");

module.exports = function(app){
  app.route("/crosscheck").get(users.requiresLogin, users.hasAuthorization, crosscheck.renderChecklists).post(users.requiresLogin, users.hasAuthorization, crosscheck.renderChecklists);
  app.route("/crosscheck/:checklistId([0-9]+)").get(users.requiresLogin, users.hasAuthorization, crosscheck.renderTasks);
  app.route("/crosscheck/content/checklists").post(users.requiresLogin, users.hasAuthorization, crosscheck.getChecklistsHTML);
  app.route("/crosscheck/content/tasks").post(users.requiresLogin, users.hasAuthorization, crosscheck.getTasksHTML);
  app.route("/crosscheck/create").post(users.requiresLogin, users.hasAuthorization, crosscheck.createChecklist);
  app.route("/crosscheck/checklist/:checklistId([0-9]+)").post(users.requiresLogin, users.hasAuthorization, crosscheck.getChecklist);
  app.route("/crosscheck/edit").post(users.requiresLogin, users.hasAuthorization, crosscheck.editChecklist);
  app.route("/crosscheck/post").post(users.requiresLogin, users.hasAuthorization, crosscheck.postTask);
  app.route("/crosscheck/task/:taskId([0-9]+)").post(users.requiresLogin, users.hasAuthorization, crosscheck.getTask);
  app.route("/crosscheck/apply").post(users.requiresLogin, users.hasAuthorization, crosscheck.applyChanges);
  app.route("/crosscheck/update").post(users.requiresLogin, users.hasAuthorization, crosscheck.updateTask);
  app.route("/crosscheck/membership/:taskId([0-9]+)").post(users.requiresLogin, users.hasAuthorization, crosscheck.getMembershipHTML);
  app.route("/crosscheck/add").post(users.requiresLogin, users.hasAuthorization, crosscheck.addToChecklist);
  app.route("/crosscheck/remove").post(users.requiresLogin, users.hasAuthorization, crosscheck.removeFromChecklist);

  app.route("/crosscheck/service/checklists").get(users.requiresToken, crosscheck.serviceChecklistsGET);
  app.route("/crosscheck/service/checklist").post(users.requiresToken, crosscheck.serviceChecklistPOST);
//app.route(/crosscheck/service/checklist/:checklistId([0-9]+)").get(users.requiresToken, crosscheck.serviceChecklistGET).put(users.requiresToken, crosscheck.serviceChecklistPUT);
  app.route("/crosscheck/service/tasks/:checklistId([0-9]+)").get(users.requiresToken, crosscheck.serviceTasksGET);
  app.route("/crosscheck/service/task").post(users.requiresToken, crosscheck.serviceTaskPOST);
  app.route("/crosscheck/service/task/:taskId([0-9]+)").put(users.requiresToken, crosscheck.serviceTaskPUT);


};

