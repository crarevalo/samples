const Model = require("../models/models.js");
const Action = Model.Action;
const Alarm = Model.Alarm;
const ChangeLog = Model.ChangeLog;
const File = Model.File;
const FileType = Model.FileType;
const Keywords = Model.Keywords;
const Nominal = Model.Nominal;
const Numbers = Model.Numbers;
const Profiles = Model.Profiles;
const Project = Model.Project;
const ProjectGroup = Model.ProjectGroup;
const ProjectGroupHeader = Model.ProjectGroupHeader;
const Section = Model.Section;
const SectionHeader = Model.SectionHeader;
const SectionType = Model.SectionType;
const Status = Model.Status;
const Tasks = Model.Tasks;
const Session = Model.Session;

const moment = require("moment-timezone");
const connection = require("../../config/sequelize");
const sequelize = require("sequelize");
const entities = require("entities");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const multer = require("multer");
const bytes = require("bytes");
const Aperture = require("./aperture.prime.server.controller.js");
const Crosscheck = require("./crosscheck.server.controller.js");
const Log = require("./aperture.log.server.controller.js");

exports.getAllProjectsJSON = function(request, response, next){
  var array = [];
  var projects = request.session.aperture.projects;
  if (projects){
    for (var key in projects){
      if (projects.hasOwnProperty(key)){
        var project = projects[key];
        if (project.status_id !== 4) array.push(project);
      }
    }
    array.sort(compareProjects);
  }
  response.writeHead(200, {"Content-Type" : "application/json"});
  response.end(JSON.stringify(array));
};

exports.renderProject = function(request, response, next){
  var user = request.session.passport.user;
  var projects = request.session.aperture.projects;
  var projectId = request.params.projectId;
  var project = projects["id_" + projectId];

  var timezone = request.session.timezone;
  var statusDefinitions = request.session.aperture.statusDefinitions;
  var sectionTypes = request.session.aperture.sectionTypes;
  var fileTypes = request.session.aperture.fileTypes;

  var promises =[];
  promises.push(getProjectIconHTML(projectId));
  promises.push(Crosscheck.getActiveChecklists());
  promises.push(Log.accessProject(user.id, projectId));
  promises.push(getLastAccessed(projectId));
  promises.push(getLastUpdated(projectId));

  Promise.all(promises).then(function(array){
    var projectImage = array[0];
    var checklists = array[1];

    var getLastAccessedResult = array[3];
    var accessed = getLastAccessedResult ? moment(getLastAccessedResult.toJSON()) : 0;
    if (accessed){
      var timezoned = accessed.tz(timezone);
      var formatted = timezoned.format("YY_MMDD_ddHHmm").toUpperCase();
      project.accessedMoment = accessed;
      project.accessedString = formatted;
    }

    var getLastUpdatedResult = array[4];
    var updated = getLastUpdatedResult ? moment(getLastUpdatedResult.toJSON()) : 0;
    if (updated){
      var timezoned = updated.tz(timezone);
      var formatted = timezoned.format("YY_MMDD_ddHHmm").toUpperCase();
      project.updatedMoment = updated;
      project.updatedString = formatted;
    }

    var data = {
      "project" : project,
      "projectImage" : projectImage,
      "statusDefinitions" : statusDefinitions.array,
      "sectionTypes" : sectionTypes.array,
      "fileTypes" : fileTypes.array,
      "checklists" : checklists
    };
    response.render("project", data);
  }).catch(function(error){
    console.log(error);
    response.render("project", {});
  });
};

exports.renameProject = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var name = request.body.name;
  var now = new Date();
  Nominal.find({where : {"project_id" : projectId, "end_date" : null}}).then(function(result){
    result.end_date = now;
    return result.save();
  }).then(function(result){
    return Nominal.create({"project_id" : projectId, "name" : name, "start_date" : now, "end_date" : null});
  }).then(function(result){
    return Log.changeProjectName(user.id, projectId, name);
  }).then(function(){
    return Aperture.loadProjects(request);
  }).then(function(result){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.saveProjectHeader = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var tag = request.body.tag;
  var statusId = request.body.status_id;
  var description = request.body.description;
  Project.find({"where" : {"id" : projectId}}).then(function(result){
    result.tag = tag;
    result.status_id = statusId;
    result.description = description;
    return result.save();
  }).then(function(result){
    return Log.updateProjectHeader(user.id, projectId);
  }).then(function(){
    return Aperture.loadProjects(request);
  }).then(function(result){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.getSectionsJSON = function(request, response, next){
  var projectId = request.params.projectId;
  SectionHeader.findAll({"where" : {"project_id" : projectId}, "order" : ["order_index"]}).then(function(headers){
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

function getLastAccessed(projectId){
  return ChangeLog.max("moment", {"where" : {"action_id" : 11, "project_id" : projectId}});
};


function getLastUpdated(projectId){
  return ChangeLog.max("moment", {"where" : {"action_id" : 4, "project_id" : projectId}});
};

function compareProjects(project1, project2){
  var str1 = "";
  if (project1) str1 = project1.name;
  if (!str1) str1 = "";

  var str2 = "";
  if (project2) str2 = project2.name;
  if (!str2) str2 = "";

  return str1.localeCompare(str2);
};

exports.serviceProjectsGET = function(request, response, next){
  return Aperture.getAllProjects().then(function(projects){
    var array = [];
    if (projects){
      for (var key in projects){
        if (projects.hasOwnProperty(key)){
          var project = projects[key];
          if (project.status_id !== 4) array.push(project);
        }
      }
      array.sort(compareProjects);
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"data" : array}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.serviceSectionsGET = function(request, response, next){
  var projectId = request.params.projectId;
  return SectionHeader.findAll({"where" : {"project_id" : projectId}, "order" : ["order_index"]}).then(function(headers){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"data" : headers}));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

