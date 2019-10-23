var Model = require("../models/models.js");
var Checklist = Model.Checklist;
var Task = Model.Task;
var ChecklistTask = Model.ChecklistTask;
var TaskEventDefinition = Model.TaskEventDefinition;
var TaskEvent = Model.TaskEvent;
var moment = require("moment-timezone");
var connection = require("../../config/sequelize");
var sequelize = require('sequelize');

/** private functions **/

function getChecklistById(checklistId){
  Checklist.findOne({where : {"id" : checklist_id}}).then(function(checklist){
    var start_str = "";
    var end_str = "";
    if (checklist){
      var date_format = ("YY_MMDD");
      if (checklist.start) start_str = moment(checklist.start).format(date_format);
      if (checklist.end) end_str = moment(checklist.end).format(date_format);
    }
    return checklist;
  }).catch(function(error){
    return null;
  });
};

function setupChecklist(name, description, dateStart, dateEnd, ages, resets){
  var checklist = Checklist.build({"name" : name, "description" : description});

  var datetime_format = "YY_MMDD HHmm";
  var start = moment.utc(dateStart + " 0000", datetime_format);
  var end = moment.utc(dateEnd + " 2359", datetime_format);
  if (start.isValid() && end.isValid() && end.isAfter(start)){
    checklist.start = start.toDate();
    checklist.end = end.toDate();
  }

  checklist.ages = (ages && (ages === "1"));
  checklist.resets = (resets && (resets === "1"));

  return checklist;
};

function getTasks(checklistId){
  var checklist = 0;
  var last_event_data = {};

  return Checklist.findOne({where : {"id" : checklistId}}).then(function(obj){
    checklist = obj;
    var query = "";
    query += "SELECT t.id, e1.code, UNIX_TIMESTAMP(e1.moment) AS event_timestamp ";
    query += "FROM checklist_task ct, task_event e1, task t ";
    query += "WHERE ct.checklist_id = ? AND t.id = e1.task_id AND t.id = ct.task_id ";
    query += "AND e1.moment = (SELECT MAX(moment) FROM task_event e2 WHERE e1.task_id = e2.task_id) GROUP BY t.id, e1.code, moment ";
    return connection.sentience.query(query, {replacements : [checklistId], type : sequelize.QueryTypes.SELECT});
  }).then(function(rows){
    for (var i = 0; i < rows.length; i++){
      var row = rows[i];
      var task_id = row.id; 
      var event_code = row.code;
      var event_timestamp = row.event_timestamp;
      last_event_data["task_" + task_id] = {"last_event_code" : event_code, "last_event_timestamp" : event_timestamp};
    }

    var query = "";
    query += "SELECT t.id, t.description, t.comment, UNIX_TIMESTAMP(e.moment) AS posted_timestamp ";
    query += "FROM checklist_task ct, task t, task_event e ";
    query += "WHERE ct.checklist_id = ? AND ct.task_id = t.id AND e.code = 0 AND t.id = e.task_id ";
    return connection.sentience.query(query, {replacements : [checklistId], type : sequelize.QueryTypes.SELECT});
  }).then(function(rows){
    return {"last_event_data" : last_event_data, "rows" : rows};
  }).catch(function(err){
    console.log(err);
    return null;
  });
};

function compareChecklists(list1, list2){
  var str1 = "";
  if (list1) str1 = list1.sort_string ? list1.sort_string : list1.name;
  if (!str1) str1 = "";
  str1 = str1.toLowerCase();

  var str2 = "";
  if (list2) str2 = list2.sort_string ? list2.sort_string : list2.name;
  if (!str2) str2 = "";
  str2 = str2.toLowerCase();

  return str1.localeCompare(str2);
};

/** checklist functions **/

exports.getActiveChecklists = function(){
  return Checklist.findAll({where : {"start" : {$or : {$eq : null, $lt : sequelize.fn('NOW')}}, "end" : {$or : {$eq : null, $gt : sequelize.fn('NOW')}}}}).then(function(checklists){
    checklists.sort(compareChecklists);
    return checklists;
  });
};

exports.getChecklistsHTML = function(request, response, next){
  exports.getActiveChecklists().then(function(checklists){
    var html = "";
    if (checklists && checklists.length){
      html += "<table>";
      for (var i = 0; i < checklists.length; i++){
        html += "<tr>";
        html += "<td><a href=\"#\" onclick=\"openChecklist('" + checklists[i].id + "');return false;\">" + checklists[i].name + "</a></td>";
        html += "<td>" + checklists[i].description + "</td>";
        html += "</tr>";
      }
      html += "</table>";
    }
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(html);
  }).catch(function(err){
    console.log(err);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("");
  });
};

exports.renderChecklists = function(request, response, next){
  response.render("checklists");
};

exports.createChecklist = function(request, response, next){
  var name = request.body.name;
  var description = request.body.description;
  var start = request.body.start;
  var end = request.body.end;
  var ages = request.body.ages;
  var resets = request.body.resets;
  var checklist = setupChecklist(name, description, start, end, ages, resets);
  checklist.save().then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Checklist created successfully."}));
  }).catch(function(err){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error creating checklist: " + err}));
  });
};

exports.getChecklist = function(request, response, next){
  var checklist_id = request.params.checklistId;
  Checklist.findOne({where : {"id" : checklist_id}}).then(function(checklist){
    var start_str = "";
    var end_str = "";
    if (checklist){
      var date_format = ("YY_MMDD");
      if (checklist.start) start_str = moment(checklist.start).format(date_format);
      if (checklist.end) end_str = moment(checklist.end).format(date_format);
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"checklist" : checklist, "start_str": start_str, "end_str" : end_str}));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error creating checklist: " + err}));
  });
};

exports.editChecklist = function(request, response, next){
  var checklist_id = request.body.checklist_id;
  Checklist.findOne({where: {"id" : checklist_id}}).then(function(checklist){
    var date_start = request.body.start;
    var date_end = request.body.end;
    var datetime_format = "YY_MMDD HHmm";
    var start = moment.utc(date_start + " 0000", datetime_format);
    var end = moment.utc(date_end + " 2359", datetime_format);
    var is_valid_range = (start.isValid() && end.isValid() && end.isAfter(start));

    return checklist.updateAttributes({
      "name" : request.body.name,
      "description" : request.body.description,
      "start" : is_valid_range ? start.toDate() : null,
      "end" : is_valid_range ? end.toDate() : null,
      "ages" : (request.body.ages && (request.body.ages === "1")),
      "resets" : (request.body.resets && (request.body.resets === "1"))
     });
  }).then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Checklist edited successfully."}));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error editing checklist: " + error}));
  });
};

/** task functions **/

exports.getActiveTasks = function(checklistId){
  return getTasks(checklistId).then(function(obj){
    var array = [];
    var rows = obj.rows;
    var last_event_data = obj.last_event_data;

    for (var i = 0; i < rows.length; i++){
      var row = rows[i];
      var task_id = row.id;
      var description = row.description;
      var comment = row.comment;
      var posted_timestamp = row.posted_timestamp;

      var last_event = last_event_data["task_" + task_id]; // access last event data
      if (!last_event) continue;
      var last_event_code = last_event.last_event_code;
      var last_event_timestamp = last_event.last_event_timestamp;
      if ((last_event_code == 2) || (last_event_code == 4)) continue; // skip checked and cancelled tasks
      
      var task = {"id" : task_id, "description" : description, "comment" : comment, "posted" : posted_timestamp, "lastEventCode" : last_event_code, "lastEventTimestamp" : last_event_timestamp};
      array.push(task);
    }
    return array;
  });
};

exports.renderTasks = function(request, response, next){
  var checklist_id = request.params.checklistId;
  Checklist.findOne({where : {"id" : checklist_id}}).then(function(checklist){
    response.render("tasks", {"checklist" : checklist});
  }).catch(function(error){
    response.render("checklists");
  });
};

exports.getTasksHTML = function(request, response, next){
  var checklistId = request.body.checklist_id;
  getTasks(checklistId).then(function(obj){
    var rows = obj.rows;
    var last_event_data = obj.last_event_data;

    var html = "<form name=\"tasks\"><table>";
    for (var i = 0; i < rows.length; i++){
      var row = rows[i];
      var task_id = row.id;
      var description = row.description;
      var comment = row.comment;
      var posted_timestamp = row.posted_timestamp;

      var last_event = last_event_data["task_" + task_id]; // access last event data
      if (!last_event) continue;
      var last_event_code = last_event.last_event_code;
      var last_event_timestamp = last_event.last_event_timestamp;
      if ((last_event_code == 2) || (last_event_code == 4)) continue; // skip checked and cancelled tasks

      var posted = moment(posted_timestamp * 1000);
      var fuzzyAge = posted.fromNow();

      html += "<tr onmouseover=\"showTaskOptions('" + task_id + "');\" onmouseout=\"hideTaskOptions('" + task_id + "');\">";
      html += "<td class=\"checkbox\"><input type=\"checkbox\" id=\"checkbox_" + task_id + "\" name=\"selected_task\" value=\"" + task_id + "\" onclick=\"checkTask('" + task_id + "');\" /></td>";
      html += "<td class=\"description\" title=\"" + comment + "\">";
      html += "<div class=\"display\">";
      html += "<span id=\"description_" + task_id + "\">" + description + "</span>";
      html += "<span class=\"superscript\">" + fuzzyAge + "</span>";
      html += "</div>";
      html += "<div id=\"task_options_" + task_id + "\" class=\"options\">";
      html += "<div id=\"task_links_" + task_id + "\">";
      html += "<span class=\"link\">[<a href=\"#\" onclick=\"showUpdateDialog('" + task_id + "');return false;\">Update</a>]</span>";
      html += "<span class=\"link\">[<a href=\"#\" onclick=\"cancelTask('" + task_id + "');return false;\">Cross Out</a>]</span>";
      html += "</div>";
      html += "<div id=\"undo_" + task_id + "\" class=\"undo\">";
      html += "<span class=\"link\">[<a href=\"#\" onclick=\"undoChanges('" + task_id + "');return false;\">Undo</a>]</span>";
      html += "</div>";
      html += "</div>";
      html += "</td>";
      html += "</tr>";
    }
    html += "</table></form>";
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(html);
  }).catch(function(err){
    console.log(err);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("");
  });
};

exports.postTask = function(request, response, next){
  var checklistId = request.body.checklist_id;
  var description = request.body.description;
  var comment = request.body.comment;
  exports.createTask(checklistId, description, comment).then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Item created successfully."}));
  }).catch(function(error){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error creating task: " + error}));
  });
};

exports.createTask = function(checklistId, description, comment){
  var task = 0;
  return Task.create({"description" : description, "comment" : comment}).then(function(result){
    task = result;
    return ChecklistTask.create({"checklist_id" : checklistId, "task_id" : task.id});
  }).then(function(result){
    return TaskEvent.create({"code" : 0, "task_id" : task.id});
  });
};

exports.getTask = function(request, response, next){
  var taskId = request.params.taskId;
  Task.findOne({where : {"id" : taskId}}).then(function(task){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"task" : task}));
  }).catch(function(error){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error creating checklist: " + err}));
  });
};

exports.updateTask = function(request, response, next){
  var task_id = request.body.task_id;
  Task.findOne({where: {"id" : task_id}}).then(function(task){
    return task.updateAttributes({
      "description" : request.body.description,
      "comment" : request.body.comment
    });
  }).then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Task updated successfully."}));
  }).catch(function(error){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error updating task: " + error}));
  });
};

exports.applyChanges = function(request, response, next){
  var checked = JSON.parse(request.body.checked);
  var cancelled = JSON.parse(request.body.cancelled);
  exports.applyCheckedAndCrossed(checked, cancelled).then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Changes applied successfully."}));
  }).catch(function(error){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error applying changes: " + error}));
  });
};

exports.applyCheckedAndCrossed = function(checkedTaskIds, crossedTaskIds){
  var inserts = [];
  if (checkedTaskIds && checkedTaskIds.length){ 
    for (var i = 0; i < checkedTaskIds.length; i++){
      inserts.push({"code" : 4, "task_id" : checkedTaskIds[i]});
    }
  } 
  if (crossedTaskIds && crossedTaskIds.length){
    for (var i = 0; i < crossedTaskIds.length; i++){
      inserts.push({"code" : 2, "task_id" : crossedTaskIds[i]});
    }
  }
  return TaskEvent.bulkCreate(inserts);
};

/** task memebership functions **/

exports.getMembershipHTML = function(request, response, next){
  var taskId = request.body.task_id;
  var containingChecklistIds = {};
  var html = "<div class=\"field_label\">Membership:</div>";
  html += "<div class=\"form_section\">&nbsp;</div>";
  var query = "SELECT checklist.* FROM checklist INNER JOIN checklist_task ON checklist.id = checklist_task.checklist_id WHERE task_id = ?";
  connection.sentience.query(query, {replacements : [taskId], model : Checklist}).then(function(checklists){
    if (checklists && checklists.length){
      for (var i = 0; i < checklists.length; i++){
        var checklistId = checklists[i].id;
        var checklistName = checklists[i].name;
        containingChecklistIds[checklistId] = 1;
        html += "<div>";
        html += "<span class=\"field_label\">" + checklistName + "</span>&nbsp;";
        html += "<span class=\"link\">[<a href=\"#\" onclick=\"removeMembership('" + checklistId + "', '" + taskId + "');return false;\">Remove</a>]</span>";
        html += "</div>";
      }
    }
    return exports.getActiveChecklists();
  }).then(function(checklists){
    html += "<div class=\"form_section\">&nbsp;</div>";
    html += "<div>";
    html += "<select name=\"selected_membership_checklist_id\">";
    if (checklists && checklists.length){
      for (var i = 0; i < checklists.length; i++){
        var checklistId = checklists[i].id;
        var checklistName = checklists[i].name;
        if (containingChecklistIds[checklistId]) continue;
        html += "<option value=\"" + checklistId + "\">" + checklistName;
      }
    }
    html += "</select>&nbsp;";
    html += "<span class=\"link\">[<a href=\"#\" onclick=\"addMembership('" + taskId + "');return false;\">Add</a>]</span>";
    html += "</div>";
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(html);
  }).catch(function(err){
    console.log(err);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("");
  });
};

exports.addToChecklist = function(request, response, next){
  var checklistId = request.body.checklist_id;
  var taskId = request.body.task_id;

  var result = ChecklistTask.build({"checklist_id" : checklistId, "task_id" : taskId});
  result.save().then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Added task to checklist."}));
  }).catch(function(error){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error adding task to checklist: " + error}));
  });
};

exports.removeFromChecklist = function(request, response, next){
  var checklistId = request.body.checklist_id;
  var taskId = request.body.task_id;

  ChecklistTask.findOne({where : {"checklist_id" : checklistId, "task_id" : taskId}}).then(function(result){
    return result.destroy();
  }).then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Removed task from checklist."}));
  }).catch(function(error){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error removing task from checklist: " + error}));
  });
};

/** web service functions **/

exports.serviceChecklistsGET = function(request, response, next){
  exports.getActiveChecklists().then(function(checklists){
    var data = [];
    if (checklists && checklists.length){
      for (var i = 0; i < checklists.length; i++){
        var obj = {};
        obj["id"] = checklists[i].id;
        obj["name"] = checklists[i].name;
        obj["description"] = checklists[i].description;
        data[i] = obj;
      }
    }

    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"data" : data}));
  }).catch(function(err){
    console.log(err);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(JSON.stringify({"error" : err}));
  });
};

exports.serviceChecklistPOST = function(request, response, next){
  var name = request.body.name;
  var description = request.body.description;
  var start = request.body.start;
  var end = request.body.end;
  var ages = request.body.ages;
  var resets = request.body.resets;
  var checklist = setupChecklist(name, description, start, end, ages, resets);
  checklist.save().then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Checklist created successfully."}));
  }).catch(function(err){
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : err}));
  });
};

exports.serviceTasksGET = function(request, response, next){
  var checklistId = request.params.checklistId;
  getTasks(checklistId).then(function(resultData){
    var rows = resultData.rows;
    var last_event_data = resultData.last_event_data;

    var data = [];
    var counter = 0;
    for (var i = 0; i < rows.length; i++){
      var row = rows[i];
      var task_id = row.id;
      var description = row.description;
      var comment = row.comment;
      var posted_timestamp = row.posted_timestamp;

      var last_event = last_event_data["task_" + task_id]; // access last event data
      if (!last_event) continue;
      var last_event_code = last_event.last_event_code;
      var last_event_timestamp = last_event.last_event_timestamp;
      if ((last_event_code == 2) || (last_event_code == 4)) continue; // skip checked and cancelled tasks

      var posted = moment(posted_timestamp * 1000);
      var fuzzyAge = posted.fromNow();
      
      var obj = {};
      obj["id"] = task_id;
      obj["description"] = description;
      obj["comment"] = comment;
      obj["fuzzy_age"] = fuzzyAge;
      data[counter++] = obj;
    }

    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"data" : data}));
  }).catch(function(err){
    console.log(err);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(JSON.stringify({"error" : err}));
  });
};

exports.serviceTaskPOST = function(request, response, next){
  var checklist_id = request.body.checklist_id;
  var task = Task.build({"description" : request.body.description, "comment" : request.body.comment});
  task.save().then(function(){
    var checklist_task = ChecklistTask.build({"checklist_id" : checklist_id, "task_id" : task.id});
    return checklist_task.save();
  }).then(function(){
    var task_event = TaskEvent.build({"code" : 0, "task_id" : task.id});
    return task_event.save();
  }).then(function(){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Item created successfully."}));
  }).catch(function(error){
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
};

exports.serviceTaskPUT = function(request, response, next){
  var taskId = request.params.taskId;
  var checklist_id = request.body.checklist_id;
  var action = request.body.event;
  
  if (action === "update"){
    Task.findOne({where: {"id" : taskId}}).then(function(task){
      return task.updateAttributes({
        "description" : request.body.description,
        "comment" : request.body.comment
      });
    }).then(function(){
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"message" : "Task updated successfully."}));
    }).catch(function(error){
      response.writeHead(500, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"error" : error}));
    });
  }
  else if ((action === "checked") || (action === "crossed")){
    var code = (action === "checked") ? "4" : "2";
    TaskEvent.build({"code" : code, "task_id" : taskId}).save().then(function(){
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"message" : "Task updated successfully."}));
    }).catch(function(err){
      response.writeHead(500, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"error" : err}));
    });
  }
  else{
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"message" : "Could not process invalid update type."}));
  }
};
