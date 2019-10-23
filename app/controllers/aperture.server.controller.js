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

function compareProjects(project1, project2){
  var str1 = "";
  if (project1) str1 = project1.name;
  if (!str1) str1 = "";

  var str2 = "";
  if (project2) str2 = project2.name;
  if (!str2) str2 = "";

  return str1.localeCompare(str2);
};

function loadStatusDefinitions(request){
  return Status.findAll().then(function(result){
    if (!result) return;
    var map = {};
    for (var i = 0; i < result.length; i++){
      var row = result[i];
      map["id_" + row.id] = {"id" : row.id, "name" : row.name, "description" : row.description};
    }
    request.session.aperture.statusDefinitions = map;
  }).catch(function(error){
    console.log(error);
  });
};

function loadSectionTypes(request){
  return SectionType.findAll({"order" : ["name"]}).then(function(result){
    if (!result) return;
    var map = {};
    for (var i = 0; i < result.length; i++){
      var row = result[i];
      map["id_" + row.id] = {"id" : row.id, "name" : row.name, "description" : row.description};
    }
    request.session.aperture.sectionTypes = map;
  }).catch(function(error){
    console.log(error);
  });
};

function loadFileTypes(request){
  return FileType.findAll().then(function(result){
    if (!result) return;
    var map = {};
    for (var i = 0; i < result.length; i++){
      var row = result[i];
      map["id_" + row.id] = {"id" : row.id, "name" : row.name, "description" : row.description};
    }
    request.session.aperture.fileTypes = map;
  }).catch(function(error){
    console.log(error);
  });
};

function loadProjects(request){
  return getAllProjects(request).then(function(result){
    request.session.aperture.projects = result;
  }).catch(function(error){
    console.log(error);
  });
}

exports.renderDashboard = function(request, response, next){
  if (!request.session.aperture){
    request.session.aperture = {};
    var promises = [];
    promises.push(loadStatusDefinitions(request));
    promises.push(loadSectionTypes(request));
    promises.push(loadFileTypes(request));
    promises.push(loadProjects(request));
    Promise.all(promises).then(function(array){
      response.render("dashboard");  
    });
  }
  else{
    response.render("dashboard");
  }
};

exports.getLastLogin = function(userId){
  var query = "";
  query += "SELECT MAX(moment) AS lastlogin FROM change_log WHERE user_id = ? AND action_id = 12 ";
  query += "AND moment < (SELECT MAX(moment) FROM change_log WHERE user_id = ? AND action_id = 12) ";
  connection.sentience.query(query, {replacements : [userId, userId], type : sequelize.QueryTypes.SELECT}).then(function(rows){
    return (rows.length == 1) ? rows[0].lastlogin : 0;
  }).catch(function(error){
    return 0;
  });
};

function getProjectName(projectId){
  return Nominal.find({where : {"project_id" : projectId, "end_date" : null}}).then(function(result){
    return result ? result.name : 0;
  });
}

function getAllProjects(request){
  var timezone = request.session.timezone;
  var map = {};
  return Project.findAll({include : [{model : Status, as : "status"}]}).then(function(projects){
    for (var i = 0; i < projects.length; i++){
      var projectId = projects[i].id;
      map["id_" + projectId] = projects[i].toJSON();
      var created = moment(map["id_" + projectId].created);
      if (created){
        var formatted = created.format("YY_MMDD_ddHHmm").toUpperCase();
        map["id_" + projectId].createdMoment = created;
        map["id_" + projectId].createdString = formatted;
      }
    }
    return Nominal.findAll({where : {"end_date" : null}});
  }).then(function(names){
    for (var i = 0; i < names.length; i++){
      var projectId = names[i].project_id;
      var name = names[i].name;
      map["id_" + projectId].name = name;
    }
    return ChangeLog.findAll({attributes : ["project_id", [sequelize.fn('MAX', sequelize.literal("moment")), "max"]], where : {"action_id" : 11, "project_id" : {$ne : null}}, group : ["project_id"]});
  }).then(function(accesses){
    for (var i = 0; i < accesses.length; i++){
      var data = accesses[i].toJSON();
      var projectId = data.project_id;
      var accessed = moment(data.max);
      if (accessed){
        var formatted = accessed.tz(timezone).format("YY_MMDD_ddHHmm").toUpperCase();
        map["id_" + projectId].accessedMoment = accessed;
        map["id_" + projectId].accessedString = formatted;
      }
    }
    return ChangeLog.findAll({attributes : ["project_id", [sequelize.fn('MAX', sequelize.literal("moment")), "max"]], where : {"action_id" : {$ne : 11}, "project_id" : {$ne : null}}, group : ["project_id"]});
  }).then(function(updates){
    for (var i = 0; i < updates.length; i++){
      var data = updates[i].toJSON();
      var projectId = data.project_id;
      var updated = moment(data.max);
      if (updated){
        var formatted = updated.tz(timezone).format("YY_MMDD_ddHHmm").toUpperCase();
        map["id_" + projectId].updatedMoment = updated;
        map["id_" + projectId].updatedString = formatted;
      }
    }
    return map;
  }).catch(function(error){
    console.log(error);
    return null;
  });
}

exports.getAllProjectsJSON = function(request, response, next){
  var array = [];
  var projects = request.session.aperture.projects;
  if (projects){
    for (var key in projects){
      if (projects.hasOwnProperty(key)) array.push(projects[key]);
    }
    array.sort(compareProjects);
  }
  response.writeHead(200, {"Content-Type" : "application/json"});
  response.end(JSON.stringify(array));
};

exports.renderProject = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.params.projectId;
  var statusDefinitions = request.session.aperture.statusDefinitions;

  var sectionTypes = [];
  var sectionTypesMap = request.session.aperture.sectionTypes;
  for (var key in sectionTypesMap){
    if (sectionTypesMap.hasOwnProperty(key)){
      sectionTypes.push({"id" : sectionTypesMap[key].id, "name" : sectionTypesMap[key].name});
    }
  }

  var fileTypes = [];
  var fileTypesMap = request.session.aperture.fileTypes;
  for (var key in fileTypesMap){
    if (fileTypesMap.hasOwnProperty(key)){
      fileTypes.push({"id" : fileTypesMap[key].id, "name" : fileTypesMap[key].name});
    }
  }

  Promise.all([getProject(projectId), getProjectName(projectId), getProjectIconHTML(projectId)]).then(function(array){
    var project = array[0];
    var projectName = array[1];
    var projectImage = array[2];

    request.session.aperture.project = project;
    var projectStatus = statusDefinitions["id_" + project.status_id].name;
    var data = {
      "project" : project,
      "projectName" : projectName,
      "projectStatus" : projectStatus,
      "projectImage" : projectImage,
      "sectionTypes" : sectionTypes,
      "fileTypes" : fileTypes
    };
    response.render("project", data);
  }).catch(function(error){
    console.log(error);
    response.render("project", {});
  });
};

function getProject(projectId){
  return Project.find({"where" : {"id" : projectId}});
};

exports.getSectionsJSON = function(request, response, next){
  var project = request.session.aperture.project;
  SectionHeader.findAll({"where" : {"project_id" : project.id}, "order" : ["order_index"]}).then(function(headers){
    var data = {"headers" : headers};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.createSection = function(request, response, next){
  var project = request.session.aperture.project;
  var name = request.body.name;
  var typeId = request.body.type_id;
  var orderIndex = 0;
  var header = 0;
  SectionHeader.max("order_index", {"where" : {"project_id" : project.id}}).then(function(max){
    if (max) orderIndex = max + 1;
    return SectionHeader.create({"project_id" : project.id, "name" : name, "order_index" : orderIndex, "type_id" : typeId});
  }).then(function(result){
    header = result;
    if ((typeId === "2") || (typeId === "3") || (typeId == "7")){ // text, grid, and memo types
      var description = "Auto-generated file for created section with id = " + header.id;
      return createFileInSection(header.id, name, description, 1); // type is text, status is open
    }
    else return false;
  }).then(function(result){
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
  var sectionId = request.params.sectionId;
  var name = request.body.name;
  SectionHeader.find({"where" : {"id" : sectionId}}).then(function(header){
    var attributes = {"name" : name};
    header.updateAttributes(attributes);
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
  var sectionId = request.params.sectionId;
  SectionHeader.destroy({"where" : {"id" : sectionId}}).then(function(){
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
  var project = request.session.aperture.project;
  var projectId = project.id;
  var sectionId = request.params.sectionId;
  var statusDefinitions = request.session.aperture.statusDefinitions;
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
    var path = "data/link_aperture/" + files[i].location;
    promises[i] = fs.statAsync(path);
  }
  return Promise.all(promises).then(function(stats){
    for (var i = 0; i < files.length; i++){
      var file = files[i];
      var fileId = file.id;
      var title = file.title;
      var description = file.description;
      //if (description) description = htmlentities(description, ENT_QUOTES); // handles double quotes since content is in attribute
      var size = bytes(stats[i].size, {decimalPlaces : 1});
      var status = statusDefinitions["id_" + file.status_id].name;
      html += "<tr>\n";
      html += "<td title=\"" + description + "\"><span><a href=\"#\" onclick=\"openFile('" + projectId + "', '" + sectionId + "', '" + fileId + "');return false;\">" + title + "</a></span></td>\n";
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
    html += "<span>[<a href=\"#\" onclick=\"openFile('" + projectId + "', '" + sectionId + "', '" + fileId + "');return false;\">edit</a>]</span>\n";
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
    html += "<span>[<a href=\"#\" onclick=\"openFile('" + projectId + "', '" + sectionId + "', '" + fileId + "');return false;\">edit</a>]</span>\n";
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
  return Tasks.find({where : {"section_id" : sectionId}}).then(function(result){
    var checklistId = result.checklist_id;
    return Crosscheck.getActiveTasks(checklistId); 
  }).then(function(tasks){
    var html = "";
    html += "<div class=\"tasks\">\n";
    html += "<div class=\"header\"><span>" + sectionName + "</span></div>\n";
    html += "<div class=\"content\">\n";
    for (var i = 0; i < tasks.length; i++){
      var task = tasks[i];
      var taskId = task.id;
      var description = task.description;
      var comment = task.comment;

      html += "<div><span><input type=\"checkbox\" name=\"\" value=\"\" onclick=\"\" />" + description + "</span></div>\n";
    }
    html += "</div>\n";
    html += "</div>\n";
  
    return html;    
  });
};

function getProjectIconHTML(projectId){
  var associations = [{model : SectionHeader, where : {"project_id" : projectId}}, {model : File, as : "file", where : {"type_id" : 13}}];
  return Section.findAll({include : associations}).then(function(result){
    var array = [];
    for (var i = 0; i < result.length; i++){
      var file = result[i].file;
      array.push(file);
    }

    var file = 0;
    if (array.length){
      var index = Math.floor(Math.random() * (array.length));
      file = array[index];
    }
    if (!file) return "";

    var url = "/aperture/file/data?filename=" + file.location;
    var html = "<div id=\"project_image\">\n<img src=\"" + url + "\" /></div>\n"; 
    return html;
  }).catch(function(error){
    console.log(error);
    return "";
  });
};

function getSectionXMLHTML(sectionId, sectionName){
  return getSection(sectionId).then(function(result){
    var files = [];
    for (var i = 0; i < result.length; i++){
      files.push(result[i].file);
    }

    var xml = 0;
    var xsl = 0;
    for (var i = 0; i < files.length; i++){
      if (files[i].type_id == 2) xml = files[i];
      else if (files[i].type_id == 14) xsl = files[i];
    }
    // if (!xml || !xsl) fail
    var html = "";
    html += "<div>XML: " + xml.location + "</div>";
    html += "<div>XSL: " + xsl.location + "</div>";
    return html;
  });
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
    html += "<div class=\"content\">\n";
    html += content + "</div>\n";
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

      html += "<tr>\n";
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

function escapeQuotes(str){
  if (!str) return str;
  return str.replace(/'/g, "\\'");
};

function getSectionRankingHTML(userId, projectId, sectionId, sectionName, statusDefinitions){
  var html = "";
  html += "<div class=\"files\">\n";
  html += "<div class=\"header\">\n";
  html += "<span>" + sectionName + "</span>\n";
  html += "</div>\n";
  html += "<div class=\"content\">\n";

  return getMostUsedFiles(userId, projectId, 5).then(function(result){
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

function getMostUsedFiles(userId, projectId, rowLimit){
  var fields = ["file_id"];//[[sequelize.fn("count", sequelize.col("file_id")), "ct"]];
  var conditions = {"file_id" : {$ne : null}, "user_id" : userId, "project_id" : projectId};
  var associations = [{model : File, as : "file"}];
  var grouping = ["file_id"];
  var sorting = [[sequelize.fn("count", sequelize.col("file_id")), "DESC"]];
  return ChangeLog.findAll({attributes : fields, where : conditions, include : associations, group : grouping, order : sorting, limit : rowLimit});
};

function prepareAsHTML(text){
  text = text.replace(/\t/g, "  ");
  text = text.replace(/\n/g, "<br/>");
  //text = entities.encodeHTML(text);
  //text = text.replace(/\n/g, "<br/>");
  return text;
};

function getFile(projectId, sectionId, fileId, session){
  var timezone = session.timezone;
  var projects = session.aperture.projects;
  if (!projects) projects = {};

  var file = 0;
  return File.find({"where" : {"id" : fileId}, "include" : [{"model" : Status}, {"model" : FileType}]}).then(function(result){
    file = result.toJSON();
    var typeId = file.type_id;
    file.editable = ((typeId === 1) || (typeId === 2) || (typeId === 3) || (typeId === 14));
    var created = moment(file.created);
    if (created){
      var formatted = created.tz(timezone).format("YY_MMDD_ddHHmm").toUpperCase();
      file.createdMoment = created;
      file.createdString = formatted;
    }

    return Keywords.findAll({"where" : {"file_id" : fileId}, "order" : ["term"]});
  }).then(function(result){
    var keywords = "";
    if (result){
      for (var i = 0; i < result.length; i++){
        var term = result[i].term;
        if (term) keywords += term + " ";
      }
    }
    file.keywords = keywords;

    var conditions = {"file_id" : fileId};
    var associations = [{model : SectionHeader, attributes : ["project_id"]}];
    var grouping = ["section.section_id", "section_header.id", "section_header.project_id"];
    return Section.findAll({attributes : [], where : conditions, include : associations, group : grouping});
  }).then(function(results){
    var str = "";
    if (results){
      for (var i = 0; i < results.length; i++){
        var projectId = results[i].section_header.project_id;
        var project = projects["id_" + projectId];
        if (project) str += project.name + " ";
      }
    }
    file.projects = str;

    return ChangeLog.max("moment", {where : {"file_id" : fileId, "action_id" : 11}});//, group : ["project_id"]});
  }).then(function(max){
    var accessed = moment(max);
    if (accessed){
      var formatted = accessed.tz(timezone).format("YY_MMDD_ddHHmm").toUpperCase();
      file.accessedMoment = accessed;
      file.accessedString = formatted;
    }
    return ChangeLog.max("moment", {where : {"file_id" : fileId, "action_id" : {$ne : 11}}});//, group : ["project_id"]});
  }).then(function(max){
    var updated = moment(max);
    if (updated){
      var formatted = updated.tz(timezone).format("YY_MMDD_ddHHmm").toUpperCase();
      file.updatedMoment = updated;
      file.updatedString = formatted;
    }
    return file;
  });
};

exports.renderFile = function(request, response, next){
  var projectId = request.params.projectId;
  var sectionId = request.params.sectionId;
  var fileId = request.params.fileId;
  getFile(projectId, sectionId, fileId, request.session).then(function(file){
    request.session.aperture.file = file;
    response.render("file", {"projectId" : projectId, "sectionId" : sectionId, "file" : file});
  });
};

exports.getFileData = function(request, response, next){
  var location = request.query.filename;
  var path = "data/link_aperture/" + location;
  fs.readFileAsync(path).then(function(data){
    var buffer = new Buffer(data);//.toString("base64");
    response.end(buffer);
  }).catch(function(error){
    console.log(error);
    response.end(0);
  });
}

exports.getFileJSON = function(request, response, next){
  var file = request.session.aperture.file;
  var typeId = file.type_id;
  var location = file.location;
  var path = "data/link_aperture/" + location;
  fs.readFileAsync(path).then(function(data){
    var buffer = new Buffer(data).toString();
    buffer = buffer.replace(/[\r]+/g, ""); // remove carriage return
    buffer = entities.encodeHTML(buffer);
    var json = {"data" : buffer};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(json));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end({});
  });
};

exports.getFileDownload = function(request, response, next){
  var file = request.session.aperture.file;
  var location = file.location;
  var path = "data/link_aperture/" + location;
  var stats = 0;
  fs.statAsync(path).then(function(result){
    stats = result;
    return fs.readFileAsync(path);
  }).then(function(data){
    var headers = {
      "Cache-Control" : "must-revalidate, post-check=0, pre-check=0",
      "Cache-Control" : "private, false",
      "Content-type" : "application/force-download",
      "Content-Transfer-Encoding" : "Binary",
      "Content-length" : stats.size,
      "Content-disposition" : "attachment; filename=" + file.title
    };
    response.writeHead(200, headers);

    var buffer = new Buffer(data);//.toString("base64");
    response.end(buffer);
  }).catch(function(error){
    console.log(error);
    response.end(0);
  });
};

var storage = multer.diskStorage({
  destination : function(request, file, callback){
    callback(null, "data/link_aperture");
  },
  filename : function(request, file, callback){
    var sessionFile = request.session.aperture.file;
    var location = sessionFile.location;
    callback(null, location);
  }
});

var upload = multer({ storage : storage}).single('upload_file');

exports.uploadFile = function(request, response, next){
  upload(request, response, function(error){
    if (error){
      return response.end("Error uploading file.");
    }
    response.end("File is uploaded");
  });
};

exports.saveFileHeader = function(request, response, next){
  var title = request.body.title || "";
  var description = request.body.description || "";
  var date = request.body.date;
  var time = request.body.time;
  var created = (date && time) ? moment.utc(date + " " + time, "YY_MMDD HHmm") : 0;
  var keywords = request.body.keywords || "";

  var projectId = request.body.project_id;
  var sectionId = request.body.section_id;
  var sessionFile = request.session.aperture.file;
  var fileId = sessionFile.id;
  File.findOne({where: {"id" : fileId}}).then(function(file){
    var attributes = {"title" : title, "description" : description};
    if (created) attributes.created = created;
    return file.updateAttributes(attributes);
  }).then(function(){
    return Keywords.destroy({"where" : {"file_id" : fileId}});
  }).then(function(){
    var array = keywords.split(" ") || [];
    var values = [];
    var used = {}; // used as map to avoid repeated terms
    for (var i = 0; i < array.length; i++){
      var term = array[i];
      if (!term || used[term]) continue;
      used[term] = 1;
      values.push({"file_id" : fileId, "term" : term});
    }
    return Keywords.bulkCreate(values);
  }).then(function(){
    return getFile(projectId, sectionId, fileId, request.session);
  }).then(function(file){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(file));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(data));
  });  
};

/* TODO: handle special chars (ms) */
exports.saveFileContent = function(request, response, next){
  var content = request.body.content;
  var file = request.session.aperture.file;
  var location = file.location;
  var path = "data/link_aperture/" + location;
  fs.writeFileAsync(path, content).then(function(result){
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

/* TODO: handle special chars (ms) */
exports.saveFileContentById = function(request, response, next){
  var fileId = request.params.fileId;
  var content = request.body.content;
  File.find({"where" : {"id" : fileId}}).then(function(file){
    var location = file.location;
    var path = "data/link_aperture/" + location;
    return fs.writeFileAsync(path, content);
  }).then(function(result){
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


exports.detachFile = function(request, response, next){
  var sectionId = request.body.section_id;
  var fileId = request.body.file_id;
  Section.destroy({"where" : {"section_id" : sectionId, "file_id" : fileId}}).then(function(){
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

exports.createFile = function(request, response, next){
  var sectionId = request.body.section_id;
  var title = request.body.title;
  var description = request.body.description;
  var typeId = request.body.type_id;
  createFileInSection(sectionId, title, description, typeId).then(function(result){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

function createFileInSection(sectionId, title, description, typeId){
  var orderIndex = 0;
  var file = 0;
  return File.create({"title" : title, "description" : description, "type_id" : typeId, "status_id" : 2}).then(function(newFile){
    file = newFile;
    var fileName = generateFileName(file.id);
    file.location = fileName;
    return file.save();
  }).then(function(){
    return Section.max("order_index", {"where" : {"section_id" : sectionId}});
  }).then(function(max){
    if (max) orderIndex = max + 1;
    return Section.create({"section_id" : sectionId, "file_id" : file.id, "order_index" : orderIndex});
  }).then(function(section){
    var path = "data/link_aperture/" + file.location;
    return fs.writeFileAsync(path, "");
  });
};

function generateFileName(fileId){
  var name = "file_" + (+fileId + 10000000000);
  name = name.replace("file_1", "file_");
  return name;
};

exports.addFile = function(request, response, next){
  var sectionId = request.body.section_id;
  var fileId = request.body.file_id;
  Section.max("order_index", {"where" : {"section_id" : sectionId}}).then(function(max){
    var orderIndex = max ? (max + 1) : 0;
    return Section.create({"section_id" : sectionId, "file_id" : fileId, "order_index" : orderIndex});
  }).then(function(section){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.reorderFiles = function(request, response, next){
  var sectionId = request.body.section_id;
  var order = JSON.parse(request.body.order);
  var promises = [];
  for (let i = 0; i < order.length; i++){ // use let to avoid scope and hoisting issues with var
    var fileId = order[i];
    var promise = Section.find({"where" : {"section_id" : sectionId, "file_id" : fileId}}).then(function(row){
      var index = i;
      row.order_index = index;
      return row.save();
    });
    promises.push(promise);
  }
  Promise.all(promises).then(function(results){
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

exports.createAlarm = function(request, response, next){
  var user = request.session.passport.user;
  var project = request.session.aperture.project;
  var projectId = project.id;
  var sectionId = request.body.section_id;
  var label = request.body.label;
  var comment = request.body.comment;
  var warning = request.body.warning;
  var schedule = request.body.schedule;
  Alarm.create({"label" : label, "comment" : comment, "user_id" : user.id, "project_id" : projectId, "section_id" : sectionId, "warning" : warning, "schedule" : schedule}).then(function(alarm){
    var data = alarm;
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.saveAlarm = function(request, response, next){
  var alarmId = request.body.alarm_id;
  var label = request.body.label;
  var comment = request.body.comment;
  var warning = request.body.warning;
  var schedule = request.body.schedule;
  Alarm.find({"where" : {"id" : alarmId}}).then(function(alarm){
    alarm.label = label;
    alarm.comment = comment;
    alarm.warning = warning;
    alarm.schedule = schedule;
    return alarm.save();
  }).then(function(result){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.removeAlarm = function(request, response, next){
  var alarmId = request.body.alarm_id;
  Alarm.destroy({"where" : {"id" : alarmId}}).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

