var Model = require("../models/models.js");
var Action = Model.Action;
var Alarm = Model.Alarm;
var ChangeLog = Model.ChangeLog;
var File = Model.File;
var FileType = Model.FileType;
var Keywords = Model.Keywords;
var Nominal = Model.Nominal;
var Numbers = Model.Numbers;
var Profiles = Model.Profiles;
var Project = Model.Project;
var ProjectGroup = Model.ProjectGroup;
var ProjectGroupHeader = Model.ProjectGroupHeader;
var Section = Model.Section;
var SectionHeader = Model.SectionHeader;
var SectionType = Model.SectionType;
var Status = Model.Status;
var Tasks = Model.Tasks;

//var moment = require("moment");
var moment = require("moment-timezone");
var connection = require("../../config/sequelize");
var sequelize = require("sequelize");
var entities = require("entities");
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var multer = require("multer");
var bytes = require("bytes");
var Crosscheck = require("./crosscheck.server.controller.js");
var ApertureFile = require("./aperture.file.server.controller.js");
var Log = require("./aperture.log.server.controller.js");

exports.createSection = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var name = request.body.name;
  var typeId = request.body.type_id;
  var orderIndex = 0;
  var header = 0;
  SectionHeader.max("order_index", {"where" : {"project_id" : projectId}}).then(function(max){
    if (max) orderIndex = max + 1;
    return SectionHeader.create({"project_id" : projectId, "name" : name, "order_index" : orderIndex, "type_id" : typeId});
  }).then(function(result){
    header = result;
    if ((typeId === "2") || (typeId === "3") || (typeId == "7")){ // text, grid, and memo types
      var description = "Auto-generated file for created section with id = " + header.id;
      return ApertureFile.createFileInSection(header.id, name, description, 1); // type is text, status is open
    }
    else return false;
  }).then(function(result){
    var note = "Created section '" + header.name + "' with type ID=" + header.type_id + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(header));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.renameSection = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.params.sectionId;
  var name = request.body.name;
  var header = 0;
  SectionHeader.find({"where" : {"id" : sectionId}}).then(function(result){
    header = result;
    var attributes = {"name" : name};
    return header.update(attributes);
  }).then(function(result){
    header = result;
    var note = "Renamed section with ID=" + header.id + " to " + header.name + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(header));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

// TODO also remove underlying content for alarm, text types, but NOT files
exports.removeSection = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.params.sectionId;
  SectionHeader.destroy({"where" : {"id" : sectionId}}).then(function(){
    var note = "Removed section with ID=" + sectionId + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    var data = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data)); 
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.reorderSections = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var order = JSON.parse(request.body.order);
  var promises = [];
  for (let i = 0; i < order.length; i++){ // use let to avoid scope and hoisting issues with var
    var sectionId = order[i];
    var promise = SectionHeader.find({"where" : {"id" : sectionId}}).then(function(header){
      var index = i;
      header.order_index = index;
      return header.save();
    });
    promises.push(promise);
  }
  Promise.all(promises).then(function(results){
    var note = "Rearranged sections to the following order: " + order + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    var data = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.getSectionHTML = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.params.sectionId;
  var statusDefinitions = request.session.aperture.statusDefinitions.map;
  SectionHeader.find({"where" : {"id" : sectionId}}).then(function(header){
    return getSectionHTML(user.id, projectId, header.id, header.name, header.type_id, statusDefinitions);
  }).then(function(html){
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(html);
  }).catch(function(err){
    console.log(err);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("");
  });
};

exports.getSectionFilesJSON = function(request, response, next){
  var sectionId = request.params.sectionId;
  getSection(sectionId).then(function(rows){
    var files = [];
    for (var i = 0; i < rows.length; i++){
      var file = rows[i].file.toJSON();
      files.push(file);
    }
    var data = {"files" : files};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

function getSection(sectionId){
  return Section.findAll({"where" : {"section_id" : sectionId}, "order" : ["order_index"], include : [{model : File, as : "file"}]});
};

function getSectionHTML(userId, projectId, sectionId, sectionName, sectionTypeId, statusDefinitions){
  switch (sectionTypeId){
    case 1: // files
      return getSectionFilesHTML(projectId, sectionId, sectionName, statusDefinitions);
    case 2: // text
      return getSectionTextHTML(projectId, sectionId, sectionName);
    case 3: // grid
      return getSectionGridHTML(projectId, sectionId, sectionName);
    case 4: // tasks
      return getSectionTasksHTML(projectId, sectionId, sectionName);
    case 6: // xml
      return getSectionXMLHTML(sectionId, sectionName);
    case 7: // memo
      return getSectionMemoHTML(projectId, sectionId, sectionName);
    case 8: // alarms
      return getSectionAlarmsHTML(userId, projectId, sectionId, sectionName);
    case 9: // ranking
     return getSectionRankingHTML(userId, projectId, sectionId, sectionName, statusDefinitions);
    case 5: //image
    default:
      return "<div class=\"error\">Error: unknown section type</div>";
  }
};

function getSectionFilesHTML(projectId, sectionId, sectionName, statusDefinitions){
  var html = "";
  html += "<div class=\"files\" onmouseenter=\"showSectionLinks('" + sectionId + "');\" onmouseleave=\"hideSectionLinks('" + sectionId + "');\">\n";
  html += "<div class=\"header\">\n";
  html += "<span>" + sectionName + "</span>\n";
  html += "<span class=\"links\">\n";
  html += "<span>[<a href=\"#\" onclick=\"openCreateFileDialog('" + sectionId + "');return false;\">new</a>]</span>\n";
  html += "<span>[<a href=\"#\" onclick=\"openAddFileDialog('" + sectionId + "');return false;\">add</a>]</span>\n";
  html += "<span>[<a href=\"#\" onclick=\"openArrangeFilesDialog('" + sectionId + "');return false;\">arrange</a>]</span>\n";
  html += "</span>\n";
  html += "</div>\n";
  html += "<div class=\"content\">\n";

  return getSection(sectionId).then(function(result){
    var files = [];
    for (var i = 0; i < result.length; i++){
      files.push(result[i].file);
    }
    return getFilesTableHTML(projectId, sectionId, sectionName, statusDefinitions, {}, files);
  }).then(function(table){
    html += table;
    html += "</div>\n";
    html += "</div>\n";
    return html;
  });
};

function getFilesTableHTML(projectId, sectionId, sectionName, statusDefinitions, fileTypeMap, files){
  var html = "";
  html += "<table>\n";

  var promises = [];
  for (var i = 0; i < files.length; i++){
    if (!files[i]) continue;
    var path = "data/link_aperture/" + files[i].location;
    promises.push(fs.statAsync(path));
  }
  return Promise.all(promises).then(function(stats){
    for (var i = 0; i < files.length; i++){
      var file = files[i];
      if (!file) continue;
      var fileId = file.id;
      var title = file.title;
      var description = file.description;
      //if (description) description = htmlentities(description, ENT_QUOTES); // handles double quotes since content is in attribute
      var size = bytes(stats[i].size, {decimalPlaces : 1});
      var status = statusDefinitions["id_" + file.status_id].name;
      html += "<tr>\n";
      html += "<td title=\"" + description + "\"><span><a href=\"/aperture/file/" + projectId + "/" + sectionId + "/" + fileId + "\">" + title + "</a></span></td>\n";
      html += "<td><span>" + status + "</span></td>\n";
      html += "<td><span class=\"file_type file_type_" + file.type_id + "\"></span></td>\n";
      html += "<td><span>" + size + "</span></td>\n";
      html += "</tr>\n";
    }
    html += "</table>\n";
    return html;
  });
}

function getSectionTextHTML(projectId, sectionId, sectionName){
  var fileId = 0;
  return Section.find({"where" : {"section_id" : sectionId}}).then(function(section){
    fileId = section.file_id;
    return File.find({"where" : {"id" : fileId}}); 
  }).then(function(file){
    var path = "data/link_aperture/" + file.location;
    return fs.readFileAsync(path);
  }).then(function(data){
    var text = new Buffer(data).toString();
    var content = prepareAsHTML(text);
    var html = "";
    html += "<div class=\"text\" onmouseenter=\"showSectionLinks('" + sectionId + "');\" onmouseleave=\"hideSectionLinks('" + sectionId + "');\">\n";
    html += "<div class=\"header\">\n";
    html += "<span>" + sectionName + "</span>\n";
    html += "<span class=\"links\">\n";
    html += "<span>[<a href=\"/aperture/file/" + projectId + "/" + sectionId + "/" + fileId + "\">edit</a>]</span>\n";
    html += "</span>\n";
    html += "</div>\n";
    html += "<div class=\"content\">\n";
    html += content + "\n";
    html += "</div>\n";
    html += "</div>\n";
    return html;
  });
};

function getSectionGridHTML(projectId, sectionId, sectionName){
  var fileId = 0;
  return Section.find({"where" : {"section_id" : sectionId}}).then(function(section){
    fileId = section.file_id;
    return File.find({"where" : {"id" : fileId}}); 
  }).then(function(file){
    var path = "data/link_aperture/" + file.location;
    return fs.readFileAsync(path);
  }).then(function(data){
    var text = new Buffer(data).toString();
    var content = prepareAsHTML(text);
    var html = "";
    html += "<div class=\"grid\" onmouseenter=\"showSectionLinks('" + sectionId + "');\" onmouseleave=\"hideSectionLinks('" + sectionId + "');\">\n";
    html += "<div class=\"header\">\n";
    html += "<span>" + sectionName + "</span>\n";
    html += "<span class=\"links\">\n";
    html += "<span>[<a href=\"/aperture/file/" + projectId + "/" + sectionId + "/" + fileId + "\">edit</a>]</span>\n";
    html += "</span>\n";
    html += "</div>\n";
    html += "<div class=\"content\">\n";
    html += "<div id=\"div_grid_content\" class=\"section_content\"><pre>" + content + "</pre></div>\n";
    html += "</div>\n";
    html += "</div>\n";
    return html;
  });
};

function getSectionTasksHTML(projectId, sectionId, sectionName){
  var checklistId = 0;
  return Tasks.find({where : {"section_id" : sectionId}}).then(function(result){
    if (result){
      checklistId = result.checklist_id;
      return Crosscheck.getActiveTasks(checklistId);
    }
    else return 0;
  }).then(function(tasks){
    var html = "";
    html += "<div class=\"tasks\" onmouseenter=\"showSectionLinks('" + sectionId + "');\" onmouseleave=\"hideSectionLinks('" + sectionId + "');\">\n";
    html += "<div class=\"header\">\n";
    html += "<span>" + sectionName + "</span>\n";
    html += "<span class=\"links\">\n";
    html += "<span>[<a href=\"#\" onclick=\"openSetupChecklistDialog('" + sectionId + "');return false;\">setup</a>]</span>\n";
    if (checklistId){
      html += "<span>[<a href=\"#\" onclick=\"gotoChecklist('" + checklistId + "');return false;\">goto</a>]</span>\n";
      html += "<span>[<a href=\"#\" onclick=\"openPostTaskDialog('" + sectionId + "', '" + checklistId + "');return false;\">post</a>]</span>\n";
      html += "<span>[<a href=\"#\" onclick=\"applyChecklistChanges('" + sectionId + "', '" + checklistId + "');return false;\">apply</a>]</span>\n";
    }
    html += "</span>\n";
    html += "</div>\n";
    html += "<div id=\"checklist_" + checklistId + "\" class=\"content\">\n";
    if (checklistId && tasks){
      for (var i = 0; i < tasks.length; i++){
        var task = tasks[i];
        var taskId = task.id;
        var description = task.description;
        var comment = task.comment;
        html += "<div class=\"task\">\n";
        html += "<div id=\"" + taskId + "\" class=\"unchecked\" onclick=\"toggleTaskState(this);\"></div>\n";
        html += "<div class=\"label\"><span>" + description + "</span></div>\n";
        html += "</div>\n";
      }
    }
    html += "</div>\n";
    html += "</div>\n";
    return html;    
  });
};

function getSectionXMLHTML(sectionId, sectionName){
  var html = "";
  html += "<div class=\"xml\" onmouseenter=\"showSectionLinks('" + sectionId + "');\" onmouseleave=\"hideSectionLinks('" + sectionId + "');\">\n";
  html += "<div class=\"header\">\n";
  html += "<span>" + sectionName + "</span>\n";
  html += "<span class=\"links\">\n";
  html += "<span>[<a href=\"#\" onclick=\"openSetupXMLDialog('" + sectionId + "');return false;\">setup</a>]</span>\n";
  html += "</span>\n";
  html += "</div>\n";
  html += "<div class=\"content\"></div>";
  html += "</div>\n";
  return html;
};

function getSectionMemoHTML(projectId, sectionId, sectionName){
  var fileId = 0;
  return Section.find({"where" : {"section_id" : sectionId}}).then(function(section){
    fileId = section.file_id;
    return File.find({"where" : {"id" : fileId}}); 
  }).then(function(file){
    var path = "data/link_aperture/" + file.location;
    return fs.readFileAsync(path);
  }).then(function(data){
    var text = new Buffer(data).toString();
    var content = prepareAsHTML(text);

    var html = "";
    html += "<div class=\"memo\" onmouseenter=\"showSectionLinks('" + sectionId + "');\" onmouseleave=\"hideSectionLinks('" + sectionId + "');\">\n";
    html += "<div class=\"header\">\n";
    html += "<span>" + sectionName + "</span>\n";
    html += "<span class=\"links\">\n";
    html += "<span>[<a href=\"#\" onclick=\"openFile('" + projectId + "', '" + sectionId + "', '" + fileId + "');return false;\">open</a>]</span>\n";
    html += "<span>[<a href=\"#\" onclick=\"openEditMemoDialog('" + sectionId + "', '" + fileId + "');return false;\">edit</a>]</span>\n";
    html += "<span>[<a href=\"#\" onclick=\"clearMemo('" + sectionId + "', '" + fileId + "');return false;\">clear</a>]</span>\n";
    html += "</span>\n";
    html += "</div>\n";
    html += "<div id=\"memo_" + sectionId + "_" + fileId + "\" class=\"content\">" + content + "</div>\n";
    html += "</div>\n";
    html += "</div>\n";
    return html;
  });
};

function getSectionAlarmsHTML(userId, projectId, sectionId, sectionName){
  return Alarm.findAll({where : {"user_id" : userId, "project_id" : projectId, "section_id" : sectionId}}).then(function(alarms){
    var html = "";
    html += "<div class=\"alarms\" onmouseenter=\"showSectionLinks('" + sectionId + "');\" onmouseleave=\"hideSectionLinks('" + sectionId + "');\">\n";
    html += "<div class=\"header\">\n";
    html += "<span>" + sectionName + "</span>\n";
    html += "<span class=\"links\">\n";
    html += "<span>[<a href=\"#\" onclick=\"openCreateAlarmDialog('" + sectionId + "');return false;\">new</a>]</span>\n";
    html += "</span>\n";
    html += "</div>\n";
    html += "<div class=\"content\">\n";

    html += "<table>\n";
    for (var i = 0; i < alarms.length; i++){
      var alarm = alarms[i];
      var id = alarm.id;
      var label = alarm.label;
      var comment = alarm.comment;
      var warning = alarm.warning;
      var schedule = alarm.schedule;

      var params = "'" + sectionId + "', '" + id + "', '" + escapeQuotes(label) + "', '" +  escapeQuotes(comment) + "', '" + warning + "', '" +  escapeQuotes(schedule) + "'";
      var onclick = "onclick=\"openEditAlarmDialog(" + params + ");return false;\"";

      html += "<tr id=\"" + id + "\">\n";
      html += "<td title=\"" + comment + "\">\n";
      html += "<span>\n";
      html += "<a class=\"link_section_alarm\" href=\"#\" " + onclick + ">" + label + "</a>\n";
      html += "</span>\n";
      html += "<td><span>" + warning + "</span></td>\n";
      html += "<td><span>" + schedule + "</span></td>\n";
      html += "</tr>\n";
    }
    html += "</table>\n";
    html += "</div>\n";
    html += "</div>\n";
    html += "</div>\n";
    return html;
  });
};

function getSectionRankingHTML(userId, projectId, sectionId, sectionName, statusDefinitions){
  var html = "";
  html += "<div class=\"files\">\n";
  html += "<div class=\"header\">\n";
  html += "<span>" + sectionName + "</span>\n";
  html += "</div>\n";
  html += "<div class=\"content\">\n";

  var files = [];

  return getMostUsedFiles(userId, projectId, 5).then(function(result){
    var promises = [];
    for (var i = 0; i < result.length; i++){
      promises.push(File.find({where : {"id" : result[i].file_id}}));
    }
    return Promise.all(promises);
  }).then(function(files){
    return getFilesTableHTML(projectId, sectionId, sectionName, statusDefinitions, {}, files);
  }).then(function(table){
    html += table;
    html += "</div>\n";
    html += "</div>\n";
    return html;
  });
};

function getMostUsedFiles(userId, projectId, rowLimit){
  var fields = ["file_id"];//[[sequelize.fn("count", sequelize.col("file_id")), "ct"]];
  var conditions = {"file_id" : {$ne : null}, "user_id" : userId, "project_id" : projectId};
  var associations = [{model : File, as : "file", attributes : []}];
  var grouping = ["file_id"];
  var sorting = [[sequelize.fn("count", sequelize.col("file_id")), "DESC"]];
  return ChangeLog.findAll({attributes : fields, where : conditions, include : associations, group : grouping, order : sorting, limit : rowLimit, raw : true});
};

exports.createAlarm = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.body.section_id;
  var label = request.body.label;
  var comment = request.body.comment;
  var warning = request.body.warning;
  var schedule = request.body.schedule;
  var alarm = 0;
  Alarm.create({"label" : label, "comment" : comment, "user_id" : user.id, "project_id" : projectId, "section_id" : sectionId, "warning" : warning, "schedule" : schedule}).then(function(result){
    var alarm = result;
    var note = "Added alarm to section with ID=" + sectionId + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(alarm));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.saveAlarm = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var alarmId = request.body.alarm_id;
  var label = request.body.label;
  var comment = request.body.comment;
  var warning = request.body.warning;
  var schedule = request.body.schedule;
  var alarm = 0;
  Alarm.find({"where" : {"id" : alarmId}}).then(function(result){
    alarm = result;
    alarm.label = label;
    alarm.comment = comment;
    alarm.warning = warning;
    alarm.schedule = schedule;
    return alarm.save();
  }).then(function(alarm){
    var note = "Updated alarm with ID=" + alarm.id + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(alarm));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.removeAlarm = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var alarmId = request.body.alarm_id;
  Alarm.destroy({"where" : {"id" : alarmId}}).then(function(){
    var note = "Removed alarm with ID=" + alarmId + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.snoozeAlarm = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var alarmId = request.body.alarm_id;
  var alarm = 0;
  Alarm.find({"where" : {"id" : alarmId}}).then(function(result){
    alarm = result;
    alarm.snoozed = sequelize.fn("NOW");
    return alarm.save();
  }).then(function(alarm){
    var note = "Snoozed alarm with ID=" + alarm.id + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(alarm));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.setupChecklist = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.body.section_id;
  var checklistId = request.body.checklist_id;
  Tasks.destroy({"where" : {"section_id" : sectionId}}).then(function(){
    return Tasks.create({"section_id" : sectionId, "checklist_id" : checklistId});
  }).then(function(){
    var note = "Checklist with ID=" + checklistId + " was assigned to section with ID=" + sectionId + ".";
    return Log.updateProjectBody(user.id, projectId, note);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.postTask = function(request, response, next){
  var checklistId = request.body.checklist_id;
  var description = request.body.description;
  var comments = request.body.comments;
  Crosscheck.createTask(checklistId, description, comments).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });  
};

exports.applyChecklistChanges = function(request, response, next){
  var checked = JSON.parse(request.body.checked);
  var crossed = JSON.parse(request.body.crossed);
  Crosscheck.applyCheckedAndCrossed(checked, crossed).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.setupXML = function(request, response, next){
  var sectionId = request.body.section_id;
  var fileIdXML = request.body.xml_id;
  var fileIdXSL = request.body.xsl_id;
  Section.destroy({"where" : {"section_id" : sectionId}}).then(function(){
    var promises = [];
    promises.push(ApertureFile.addFileToSection(sectionId, fileIdXML));
    promises.push(ApertureFile.addFileToSection(sectionId, fileIdXSL));
    return Promise.all(promises);
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.getXMLData = function(request, response, next){
  var sectionId = request.body.section_id;
  getSection(sectionId).then(function(rows){
    var fileIdXML = 0;
    var fileIdXSL = 0;
    for (var i = 0; i < rows.length; i++){
      var file = rows[i].file.toJSON();
      var typeId = file.type_id;
      if (typeId === 2) fileIdXML = file.id;
      else if (typeId === 14) fileIdXSL = file.id;
    }
    var promises = [];
    promises.push(File.find({"where" : {"id" : fileIdXML}}));
    promises.push(File.find({"where" : {"id" : fileIdXSL}}));
    return Promise.all(promises);
  }).then(function(array){
    var fileXML = array[0];
    var fileXSL = array[1];
    if (fileXML && fileXSL){
      var pathXML = "data/link_aperture/" + fileXML.location;
      var pathXSL = "data/link_aperture/" + fileXSL.location;
      var promises = [];
      promises.push(fs.readFileAsync(pathXML));
      promises.push(fs.readFileAsync(pathXSL));
      return Promise.all(promises);
    }
    else return 0;
  }).then(function(array){
    var json = {};
    if (array){
      var dataXML = new Buffer(array[0]).toString();
      var dataXSL = new Buffer(array[1]).toString();
      json = {"xml" : dataXML, "xsl" : dataXSL};
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(json));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

function escapeQuotes(str){
  if (!str) return str;
  return str.replace(/'/g, "\\'");
};

function prepareAsHTML(text){
  text = text.replace(/\t/g, "  ");
  text = text.replace(/\n/g, "<br/>");
  //text = entities.encodeHTML(text);
  //text = text.replace(/\n/g, "<br/>");
  return text;
};

exports.serviceSectionFilesGET = function(request, response, next){
  var sectionId = request.params.sectionId;
  return getSection(sectionId).then(function(rows){
    var files = [];
    for (var i = 0; i < rows.length; i++){
      var file = rows[i].file.toJSON();
      files.push(file);
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"data" : files}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

