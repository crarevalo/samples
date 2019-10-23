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
const crypto = require("crypto");

var moment = require("moment-timezone");
var connection = require("../../config/sequelize");
var sequelize = require("sequelize");
var entities = require("entities");
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var multer = require("multer");
var bytes = require("bytes");
var Crosscheck = require("./crosscheck.server.controller.js");
var Log = require("./aperture.log.server.controller.js");

exports.renderFile = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.params.projectId;
  var sectionId = request.params.sectionId;
  var fileId = request.params.fileId;
  Log.accessFile(user.id, projectId, fileId).then(function(){
    return getFile(projectId, sectionId, fileId, request.session);
  }).then(function(file){
    response.render("file", {"projectId" : projectId, "sectionId" : sectionId, "file" : file});
  }).catch(function(error){
    console.log(error);
    response.render("dashboard");
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
  const typeId = request.body.type_id;
  const location = request.body.location;
  const path = "data/link_aperture/" + location;
  fs.readFileAsync(path).then(function(data){
    let buffer = new Buffer(data).toString();
    const hash = crypto.createHash("md5").update(buffer).digest("hex");
    buffer = buffer.replace(/[\r]+/g, ""); // remove carriage return
    buffer = entities.encodeHTML(buffer);
    const json = {"data" : buffer, "hash" : hash};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(json));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end({});
  });
};

exports.getFileDownload = function(request, response, next){
  var fileId = request.params.fileId;
  var title = 0;
  var path = 0;
  var stats = 0;
  File.find({"where" : {"id" : fileId}}).then(function(file){
    title = file.title;
    path = "data/link_aperture/" + file.location;
    return fs.statAsync(path);
  }).then(function(result){
    stats = result;
    return fs.readFileAsync(path);
  }).then(function(data){
    var headers = {
      "Cache-Control" : "must-revalidate, post-check=0, pre-check=0",
      "Cache-Control" : "private, false",
      "Content-type" : "application/force-download",
      "Content-Transfer-Encoding" : "Binary",
      "Content-length" : stats.size,
      "Content-disposition" : "attachment; filename=" + title
    };
    response.writeHead(200, headers);

    var buffer = new Buffer(data);//.toString("base64");
    response.end(buffer);
  }).catch(function(error){
    console.log(error);
    response.end(0);
  });
};

exports.uploadFile = function(request, response, next){
  const storage = multer.diskStorage({
    destination : function(request, file, callback){
      callback(null, "data/link_aperture");
    },
    filename : function(request, file, callback){
      const location = request.body.location;
      callback(null, location);
    }
  });

  const upload = multer({storage}).single("upload_file");

  upload(request, response, function(error){
    if (error){
      return response.end("Error uploading file.");
    }
    const user = request.session.passport.user;
    const projectId = request.body.project_id;
    const fileId = request.body.file_id;
    Log.updateFileBody(user.id, projectId, fileId, null).then(function(){
      response.end("File is uploaded");
    }).catch(function(error){
      response.end("Uploaded file successfully but could not log event.");
    });
  });
};

exports.saveFileHeader = function(request, response, next){
  var user = request.session.passport.user;
  var title = request.body.title || "";
  var description = request.body.description || "";
  var date = request.body.date;
  var time = request.body.time;
  var created = (date && time) ? moment.utc(date + " " + time, "YY_MMDD HHmm") : 0;
  var keywords = request.body.keywords || "";

  var projectId = request.body.project_id;
  var sectionId = request.body.section_id;
  var fileId = request.body.file_id;
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
    return Log.updateFileHeader(user.id, projectId, fileId, null);
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
  const user = request.session.passport.user;
  const content = request.body.content;
  const projectId = request.body.project_id;
  const fileId = request.body.file_id;
  const location = request.body.location;
  const path = "data/link_aperture/" + location;
  fs.writeFileAsync(path, content).then(function(result){
    return Log.updateFileBody(user.id, projectId, fileId, null);
  }).then(function(){
    let hash = crypto.createHash("md5").update(content).digest("hex");
    const data = {"hash" : hash};
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
  var user = request.session.passport.user;
  var fileId = request.params.fileId;
  var projectId = request.body.project_id;
  var content = request.body.content;
  File.find({"where" : {"id" : fileId}}).then(function(file){
    var location = file.location;
    var path = "data/link_aperture/" + location;
    return fs.writeFileAsync(path, content);
  }).then(function(result){
    return Log.updateFileBody(user.id, projectId, fileId, null);
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

exports.detachFile = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.body.section_id;
  var fileId = request.body.file_id;
  Section.destroy({"where" : {"section_id" : sectionId, "file_id" : fileId}}).then(function(){
    var note = "Removed file from section with ID=" + sectionId + ".";
    return Log.removeFile(user.id, projectId, fileId, note);
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

exports.createFile = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.body.section_id;
  var title = request.body.title;
  var description = request.body.description;
  var typeId = request.body.type_id;
  exports.createFileInSection(sectionId, title, description, typeId).then(function(result){
    var note = "Created file in section with ID=" + sectionId + ".";
    return Log.addFile(user.id, projectId, result.id, note);
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

exports.addFile = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
  var sectionId = request.body.section_id;
  var fileId = request.body.file_id;
  exports.addFileToSection(sectionId, fileId).then(function(section){
    var note = "Added file to section with ID=" + sectionId + ".";
    return Log.addFile(user.id, projectId, fileId, note);
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

exports.addFileToSection = function(sectionId, fileId){
  return Section.max("order_index", {"where" : {"section_id" : sectionId}}).then(function(max){
    var orderIndex = max ? (max + 1) : 0;
    return Section.create({"section_id" : sectionId, "file_id" : fileId, "order_index" : orderIndex});
  });
};

exports.reorderFiles = function(request, response, next){
  var user = request.session.passport.user;
  var projectId = request.body.project_id;
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
    var note = "Rearranged files for section with ID=" + sectionId + " to the following order: " + order + ".";
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

exports.createFileInSection = function(sectionId, title, description, typeId){
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
  }).then(function(){
    return file;
  });
};

function generateFileName(fileId){
  var name = "file_" + (+fileId + 10000000000);
  name = name.replace("file_1", "file_");
  return name;
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

exports.serviceFileGET = function(request, response, next){
  var fileId = request.params.fileId;
  return File.find({"where" : {"id" : fileId}}).then(function(file){
    var location = file.location;
    var path = "data/link_aperture/" + location;
    return fs.readFileAsync(path);
  }).then(function(data){
    var buffer = new Buffer(data).toString();
    //buffer = buffer.replace(/[\r]+/g, ""); // remove carriage return
    //buffer = entities.encodeHTML(buffer);
    var json = {"data" : buffer};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(json));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end({});
  });
};

