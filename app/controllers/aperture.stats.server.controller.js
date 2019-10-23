const Model = require("../models/models.js");
const User = Model.User;
const Action = Model.Action;
const ChangeLog = Model.ChangeLog;
const Section = Model.Section;
const SectionHeader = Model.SectionHeader;
const File = Model.File;

const moment = require("moment-timezone");
const sequelize = require("sequelize");
const connection = require("../../config/sequelize");
const Promise = require("bluebird");
const bytes = require("bytes");
const prime = require("./aperture.prime.server.controller.js");

exports.getMostRecentlyAccessed = function(userId, limit){
  var params = {
    "attributes" : ["project_id", [sequelize.fn("MAX", sequelize.col("moment")), "most_recent"]],
    "where" : {"user_id" : userId, "project_id" : {$ne : null}, "action_id" : 11},
    "group" : ["project_id"],
    "order" : "most_recent DESC",
  }
  if (limit) params["limit"] = +limit;
  return ChangeLog.findAll(params).then(function(result){
    var array = [];
    for (var i = 0; i < result.length; i++){
      var row = result[i].toJSON();
      var ago = moment(row.most_recent).fromNow();
      array.push({"project_id" : row.project_id, "moment" : ago});
    }
    return array;
  });
};

exports.getMostRecentlyAccessedJSON = function(request, response, next){
  var user = request.session.passport.user;
  var projects = request.session.aperture.projects;
  var limit = request.body.limit;
  exports.getMostRecentlyAccessed(user.id, limit).then(function(array){
    var result = [];
    for (var i = 0; i < array.length; i++){
      var projectId = array[i].project_id;
      var project = projects["id_" + projectId];
      if (project) result.push({"id" : projectId, "name" : project.name, "value" : array[i].moment});
    }
    var data = {"result" : result};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error); 
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.getMostRecentlyUpdated = function(userId, limit){
  var params = {
    "attributes" : ["project_id", [sequelize.fn("MAX", sequelize.col("moment")), "most_recent"]],
    "where" : {"user_id" : userId, "project_id" : {$ne : null}, "action_id" : 4},
    "group" : ["project_id"],
    "order" : "most_recent DESC",
  }
  if (limit) params["limit"] = +limit;
  return ChangeLog.findAll(params).then(function(result){
    var array = [];
    for (var i = 0; i < result.length; i++){
      var row = result[i].toJSON();
      var ago = moment(row.most_recent).fromNow();
      array.push({"project_id" : row.project_id, "moment" : ago});
    }
    return array;
  });
};

exports.getMostRecentlyUpdatedJSON = function(request, response, next){
  var user = request.session.passport.user;
  var projects = request.session.aperture.projects;
  var limit = request.body.limit;
  exports.getMostRecentlyUpdated(user.id, limit).then(function(array){
    var result = [];
    for (var i = 0; i < array.length; i++){
      var projectId = array[i].project_id;
      var project = projects["id_" + projectId];
      if (project) result.push({"id" : projectId, "name" : project.name, "value" : array[i].moment});
    }
    var data = {"result" : result};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error); 
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
}; 

exports.getMostAccessed = function(userId, limit, startMoment){
  var params = {
    "attributes" : ["project_id", [sequelize.fn("COUNT", sequelize.col("*")), "ct"]],
    "where" : {"user_id" : userId, "project_id" : {$ne : null}, "action_id" : 11},
    "group" : ["project_id"],
    "order" : "ct DESC",
  }
  if (limit) params["limit"] = +limit;
  if (startMoment) params["where"].moment = {"$gt" : startMoment};
  return ChangeLog.findAll(params).then(function(result){
    var array = [];
    for (var i = 0; i < result.length; i++){
      var row = result[i].toJSON();
      array.push({"project_id" : row.project_id, "count" : row.ct});
    }
    return array;
  }).catch(function(error){
    console.log(error);
    return 0;
  });
};

exports.getMostAccessedJSON = function(request, response, next){
  var user = request.session.passport.user;
  var projects = request.session.aperture.projects;
  var limit = request.body.limit;
  exports.getMostAccessed(user.id, limit).then(function(array){
    var result = [];
    for (var i = 0; i < array.length; i++){
      var projectId = array[i].project_id;
      var project = projects["id_" + projectId];
      result.push({"id" : projectId, "name" : project.name, "value" : array[i].count});
    }
    var data = {"result" : result};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error); 
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
}; 

exports.getMostUpdated = function(userId, limit, startMoment, endMoment){
  var params = {
    "attributes" : ["project_id", [sequelize.fn("COUNT", sequelize.col("*")), "ct"]],
    "where" : {"user_id" : userId, "project_id" : {$ne : null}, "action_id" : 4},
    "group" : ["project_id"],
    "order" : "ct DESC",
  }
  if (limit) params["limit"] = +limit;
  if (startMoment) params["where"].moment = {"$gte" : startMoment};
  if (endMoment) params["where"].moment["$lte"] = endMoment;
  return ChangeLog.findAll(params).then(function(result){
    var array = [];
    for (var i = 0; i < result.length; i++){
      var row = result[i].toJSON();
      array.push({"project_id" : row.project_id, "count" : row.ct});
    }
    return array;
  });
};

exports.getMostUpdatedJSON = function(request, response, next){
  var user = request.session.passport.user;
  var projects = request.session.aperture.projects;
  var limit = request.body.limit;
  exports.getMostUpdated(user.id, limit).then(function(array){
    var result = [];
    for (var i = 0; i < array.length; i++){
      var projectId = array[i].project_id;
      var project = projects["id_" + projectId];
      result.push({"id" : projectId, "name" : project.name, "value" : array[i].count});
    }
    var data = {"result" : result};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.getBasedOnFileCount = function(limit){
  var query = "SELECT project_id, count(*) as ct FROM section_header JOIN section ON section_header.id = section.section_id GROUP BY project_id ORDER BY ct desc ";
  if (limit) query += "limit " + limit + " ";
  return connection.sentience.query(query, {"type" : sequelize.QueryTypes.SELECT}).then(function(result){
    var array = [];
    for (var i = 0; i < result.length; i++){
      var row = result[i];
      array.push({"project_id" : row.project_id, "count" : row.ct});
    }
    return array;
  });
};

exports.getBasedOnFileCountJSON = function(request, response, next){
  var projects = request.session.aperture.projects;
  var limit = request.body.limit;
  exports.getBasedOnFileCount(limit).then(function(array){
    var result = [];
    for (var i = 0; i < array.length; i++){
      var projectId = array[i].project_id;
      var project = projects["id_" + projectId];
      result.push({"id" : projectId, "name" : project.name, "value" : array[i].count});
    }
    var data = {"result" : result};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

function getPieChart(userId, projects, year, month){
  var startDate = moment();
  startDate.startOf("month");
  
  if (year && month){
    startDate = moment(year + "_" + month, "YYYY_MM");
    startDate.startOf("month");
  }

  var endDate = moment(startDate);
  endDate.endOf("month");

  return exports.getMostUpdated(userId, 5, startDate, endDate).then(function(result){
    var labels = [];
    var data = [];
    var colors = ["#2ECC71", "#3498DB", "#95A5A6", "#9B59B6", "#F1C40F"];
    for (var i = 0; i < result.length; i++){
      var row = result[i];
      var projectId = row.project_id;
      var project = projects["id_" + projectId];
      var count = row.count;
      labels.push(project.name);
      data.push(count);
    }
    colors = colors.slice(0, data.length);
    var datasets = [{"backgroundColor" : colors, "data" : data}];
    return (labels.length > 0) ? {"labels" : labels, "datasets" : datasets} : 0;
  });
};

function getLineChart(userId, projects, start){
  var startMoment = start;
  if (!startMoment){
    startMoment = moment().subtract(6, "month");
    startMoment.startOf("month");
  }

  var data = [];
  var params = {
    "where" : {"user_id" : userId, "moment" : {"$gt" : startMoment}, "project_id" : {"$ne" : null}, "file_id" : {"$ne" : null}, "action_id" : 4},
    "order" : ["moment"]
  };
  return ChangeLog.findAll(params).then(function(result){
    if (result){
      for (var i = 0; i < result.length; i++){
        var row = result[i];

        var occurred = moment(row.moment);
        occurred.startOf("month");

        var index = occurred.diff(startMoment, "months");
        var count = data[index];
        data[index] = count ? (count + 1) : 1;
      }
      var labels = [];
      for (var i = 0; i < data.length; i++){
        var m = startMoment.clone().add(i, "months");
        labels[i] = m.format("MMM 'YY"); 
      }
      var datasets = [{"label" : "Updates", "backgroundColor" : "#2ECC71", "data" : data}];
      return (labels.length > 0) ? {"labels" : labels, "datasets" : datasets} : 0;
    }
    else return 0;
  });
};

exports.getChartsJSON = function(request, response, next){
  var user = request.session.passport.user;
  var projects = request.session.aperture.projects;
  var start = request.body.start;
  var startMoment = start ? moment(start, "YY_MMDD") : 0;
  var year = request.body.year;
  var month = request.body.month;
  Promise.all([getPieChart(user.id, projects, year, month), getLineChart(user.id, projects, startMoment)]).then(function(array){
    var data = {"pie" : array[0], "line" : array[1]};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.renderChangeLog = function(request, response, next){
  prime.getAllProjects().then(function(result){
    if (!request.session.aperture) request.session.aperture = {};
    request.session.aperture.projects = result;
    response.render("changelog");
  }).catch(function(error){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
};

exports.getChangeLogJSON = function(request, response, next){
  const timezone = request.session.timezone;
  const projects = request.session.aperture.projects;
  const startDate = request.query.startDate;
  const endDate = request.query.endDate;

  const date_format = "YY_MMDD";
  const time_format = "HHmm"; 
  let start = moment(startDate + " 0000", date_format + " " + time_format);
  let end = moment(endDate + " 2359", date_format + " " + time_format);

  let condition = {};
  if (start.isValid() && end.isValid() && end.isAfter(start)){
    condition["moment"] = {between : [start.toDate(), end.toDate()]};
  }
  let associations = [
    {model : User, as : "user", attributes : ["username"]},
    {model : File, as : "file", attributes : ["title"]},
    {model : Action, as : "action", attributes : ["name"]}
  ];

  ChangeLog.findAll({where : condition, include : associations, order : ["moment"]}).then(function(result){
    let log = [];
    if (result && result.length){
      for (let i = 0; i < result.length; i++){
        const row = result[i];
        const userId = row.user_id;
        const username = row.user ? row.user.username : null;
        const projectId = row.project_id;
        const project = projects["id_" + projectId];
        const projectName = project ? project.name : "";
        const fileId = row.file_id;
        const fileTitle = row.file ? row.file.title : null;
        const action = row.action ? row.action.name : null;
        const datetime = row.moment ? getZeroFormat(row.moment, true, timezone) : "";
        log.push({rowId : ("changelogrowid_" + i), user : {id : userId, username}, project : {id : projectId, name : projectName}, file : {id : fileId, title : fileTitle}, action, datetime});
      }
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(log));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end({});
  });
};

function getZeroFormat(str, include_time, timezone){
  var m = moment(str);
  if (timezone) m = m.tz(timezone);
  var format = "YY_MMDD" + (include_time ? "_ddHHmm" : "");
  var display = m.format(format);
  if (display) display = display.toUpperCase();
  return display;
};

