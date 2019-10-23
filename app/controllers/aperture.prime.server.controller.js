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

const moment = require("moment-timezone");
const connection = require("../../config/sequelize");
const sequelize = require("sequelize");
const entities = require("entities");
const later = require("later");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const multer = require("multer");
const bytes = require("bytes");
const Stats = require("./aperture.stats.server.controller.js");
const Crosscheck = require("./crosscheck.server.controller.js");

exports.renderDashboard = function(request, response, next){
  if (!request.session.aperture){
    request.session.aperture = {};
    let promises = [];
    promises.push(loadStatusDefinitions(request));
    promises.push(loadSectionTypes(request));
    promises.push(loadFileTypes(request));
    promises.push(exports.loadProjects(request));
    Promise.all(promises).then(function(array){
      response.render("dashboard");  
    });
  }
  else{
    response.render("dashboard");
  }
};

exports.getLastLogin = function(userId){
  let query = "";
  query += "SELECT MAX(moment) AS lastlogin FROM change_log WHERE user_id = ? AND action_id = 12 ";
  query += "AND moment < (SELECT MAX(moment) FROM change_log WHERE user_id = ? AND action_id = 12) ";
  connection.sentience.query(query, {replacements : [userId, userId], type : sequelize.QueryTypes.SELECT}).then(function(rows){
    return (rows.length == 1) ? rows[0].lastlogin : 0;
  }).catch(function(error){
    return 0;
  });
};

exports.getProjectGroupsJSON = function(request, response, next){
  let projects = request.session.aperture.projects;
  let associations = [{model : ProjectGroup}];
  ProjectGroupHeader.findAll({"include" : associations, "order" : ["name"]}).then(function(headers){
    let array = [];
    for (let i = 0; i < headers.length; i++){
      let header = headers[i].toJSON();
      let groups = header.project_groups;
      for (let j = 0; j < groups.length; j++){
        let group = groups[j];
        let project = projects["id_" + group.project_id];
        if (project.status_id !== 4) group.project = project;
      }
      groups.sort(compareProjectsInGroup);
      array.push(header);
    }
    let data = {"result" : array};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.createProjectGroup = function(request, response, next){
  const name = request.body.group_name;
  ProjectGroupHeader.create({"name" : name}).then(function(result){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });

};

exports.deleteProjectGroup = function(request, response, next){
  const id = request.body.group_id;
  ProjectGroupHeader.destroy({"where" : {"id" : id}}).then(function(){
    const data = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.selectProjectGroups = function(request, response, next){
  const order = JSON.parse(request.body.order);
  ProjectGroupHeader.update({"order_index" : null}, {"where" : {}}).then(function(){
    let promises = [];
    for (let i = 0; i < order.length; i++){ // use let to avoid scope and hoisting issues with let
      const groupId = order[i];
      const promise = ProjectGroupHeader.find({"where" : {"id" : groupId}}).then(function(row){
        const index = i;
        row.order_index = index;
        return row.save();
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  }).then(function(results){
    const data = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.updateProjectGroup = function(request, response, next){
  const projects = request.session.aperture.projects;
  const groupId = request.params.groupId;
  const name = request.body.name;
  const projectIds = JSON.parse(request.body.projects);
  ProjectGroupHeader.update({"name" : name}, {"where" : {"id" : groupId}}).then(function(){
    return ProjectGroup.destroy({"where" : {"project_group_id" : groupId}});
  }).then(function(){
    let promises = [];
    for (let i = 0; i < projectIds.length; i++){ // use let to avoid scope and hoisting issues with let
      const projectId = projectIds[i];
      const promise = ProjectGroup.create({"project_group_id" : groupId, "project_id" : projectId});
      promises.push(promise);
    } 
    return Promise.all(promises);
  }).then(function(){
    const associations = [{model : ProjectGroup}];
    return ProjectGroupHeader.find({"where" : {"id" : groupId}, "include" : associations});
  }).then(function(header){
    const projectGroup = header.toJSON();
    const groups = projectGroup.project_groups;
    for (let j = 0; j < groups.length; j++){
      const group = groups[j];
      const project = projects["id_" + group.project_id];
      if (project.status_id !== 4) group.project = project;
    }
    groups.sort(compareProjectsInGroup);
    const data = {"group" : projectGroup};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.getMemos = function(request, response, next){
  let projectIds = [];
  const associations = [{model : SectionHeader, where : {"type_id" : 7}}, {model : File, as : "file"}];
  return Section.findAll({include : associations}).then(function(result){
    let promises = [];
    for (let i = 0; i < result.length; i++){
      const projectId = result[i].section_header.project_id;
      projectIds.push(projectId);
      const location = result[i].file.location;
      const path = "data/link_aperture/" + location;
      promises.push(fs.readFileAsync(path));
    }
    return Promise.all(promises);
  }).then(function(array){
    let data = [];
    for (let i = 0; i < array.length; i++){
      const buffer = new Buffer(array[i]);
      data.push({"projectId" : projectIds[i], "memo" : buffer.toString()});
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.getAlarms = function(request, response, next){
  const user = request.session.passport.user;
  const now = moment();
  Alarm.findAll({"where" : {"user_id" : user.id}}).then(function(alarms){
    let data = [];
    for (let i = 0; i < alarms.length; i++){
      const alarm = alarms[i];
      const projectId = alarm.project_id;
      const label = alarm.label;
      const comment = alarm.comment;
      const warning = alarm.warning;
      const cron = alarm.schedule;
      const schedule = later.parse.cron(cron);
      const nxt = later.schedule(schedule).next(1);
      const end = moment(nxt);
      const start = end.clone().subtract(warning, "days");
      if (now.isBetween(start, end)){
        const snoozed = alarm.snoozed ? moment(alarm.snoozed).isBetween(start, end) : 0;
        if (!snoozed) data.push({"projectId" : projectId, "label" : label, "comment" : comment});
      }
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

function loadStatusDefinitions(request){
  return Status.findAll().then(function(result){
    if (!result) return;
    let map = {};
    for (let i = 0; i < result.length; i++){
      const row = result[i];
      map["id_" + row.id] = {"id" : row.id, "name" : row.name, "description" : row.description};
    }

    let array = [];
    for (let key in map){
      if (map.hasOwnProperty(key)){
        const status = map[key];
        array.push({"id" : status.id, "name" : status.name});
      }
    }

    request.session.aperture.statusDefinitions = {};
    request.session.aperture.statusDefinitions.map = map;
    request.session.aperture.statusDefinitions.array = array;
  }).catch(function(error){
    console.log(error);
  });
};

function loadSectionTypes(request){
  return SectionType.findAll({"order" : ["name"]}).then(function(result){
    if (!result) return;
    let map = {};
    for (let i = 0; i < result.length; i++){
      const row = result[i];
      map["id_" + row.id] = {"id" : row.id, "name" : row.name, "description" : row.description};
    }

    let array = [];
    for (let key in map){
      if (map.hasOwnProperty(key)){
        const sectionType = map[key];
        array.push({"id" : sectionType.id, "name" : sectionType.name});
      }
    }

    request.session.aperture.sectionTypes = {};
    request.session.aperture.sectionTypes.map = map;
    request.session.aperture.sectionTypes.array = array;
  }).catch(function(error){
    console.log(error);
  });
};

function loadFileTypes(request){
  return FileType.findAll().then(function(result){
    if (!result) return;
    let map = {};
    for (let i = 0; i < result.length; i++){
      const row = result[i];
      map["id_" + row.id] = {"id" : row.id, "name" : row.name, "description" : row.description};
    }

    let array = [];
    for (let key in map){
      if (map.hasOwnProperty(key)){
        const fileType = map[key];
        array.push({"id" : fileType.id, "name" : fileType.name});
      }
    }

    request.session.aperture.fileTypes = {};
    request.session.aperture.fileTypes.map = map;
    request.session.aperture.fileTypes.array = array;
  }).catch(function(error){
    console.log(error);
  });
};

exports.loadProjects = function(request){
  return exports.getAllProjects().then(function(result){
    request.session.aperture.projects = result;
    return result;
  });
}

exports.getAllProjects = function(){
  let map = {};
  return Project.findAll({"include" : [{model : Status, as : "status"}]}).then(function(projects){
    for (let i = 0; i < projects.length; i++){
      const projectId = projects[i].id;
      map["id_" + projectId] = projects[i].toJSON();
      const created = moment(map["id_" + projectId].created);
      if (created){
        const formatted = created.format("YY_MMDD_ddHHmm").toUpperCase();
        map["id_" + projectId].createdMoment = created;
        map["id_" + projectId].createdString = formatted;
      }
    }
    return Nominal.findAll({where : {"end_date" : null}});
  }).then(function(names){
    for (let i = 0; i < names.length; i++){
      const projectId = names[i].project_id;
      const name = names[i].name;
      const project = map["id_" + projectId];
      if (project) project.name = name;
    }
    return map;
  }).catch(function(error){
    console.log(error);
    return null;
  });
}

function compareProjectsInGroup(group1, group2){
  let str1 = "";
  if (group1 && group1.project) str1 = group1.project.name;
  if (!str1) str1 = "";

  let str2 = "";
  if (group2 && group2.project) str2 = group2.project.name;
  if (!str2) str2 = "";

  return str1.localeCompare(str2);
};

/** web service functions **/

exports.serviceAlarmsGET = function(request, response, next){
  const userId = request.decoded.id;
  const now = moment();
  Alarm.findAll({"where" : {"user_id" : userId}}).then(function(alarms){
    let data = [];
    for (let i = 0; i < alarms.length; i++){
      const alarm = alarms[i]; 
      const projectId = alarm.project_id;
      const label = alarm.label;
      const comment = alarm.comment;
      const warning = alarm.warning;
      const cron = alarm.schedule; 
      const schedule = later.parse.cron(cron);
      const next = later.schedule(schedule).next(1);
      const end = moment(next);
      const start = end.clone().subtract(warning, "days");
      if (now.isBetween(start, end)){
        const snoozed = alarm.snoozed ? moment(alarm.snoozed).isBetween(start, end) : 0;
        if (!snoozed) data.push({"projectId" : projectId, "label" : label, "comment" : comment});
      }
    } 
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"data" : data}));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.serviceMemosGET = function(request, response, next){
  let projectIds = [];
  const associations = [{model : SectionHeader, where : {"type_id" : 7}}, {model : File, as : "file"}];
  return Section.findAll({include : associations}).then(function(result){
    let promises = [];
    for (let i = 0; i < result.length; i++){
      let projectId = result[i].section_header.project_id;
      projectIds.push(projectId);
      const location = result[i].file.location;
      const path = "data/link_aperture/" + location;
      promises.push(fs.readFileAsync(path));
    }
    return Promise.all(promises);
  }).then(function(array){
    let data = [];
    for (let i = 0; i < array.length; i++){
      const buffer = new Buffer(array[i]);
      data.push({"projectId" : projectIds[i], "memo" : buffer.toString()});
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"data" : data}));
  }).catch(function(error){
    console.log(error);
    const data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

