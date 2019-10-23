var fs = require("fs");
var Model = require("../models/models.js");
var Scan = Model.Scan;
var ScanGrouping = Model.ScanGrouping;
var ScanGroupingDefinition = Model.ScanGroupingDefinition;
var connection = require("../../config/sequelize");

// used for testing
exports.renderScans = function(request, response, next){
  getGrouping(3).then(function(result){
    var scans = [];
    for (var i = 0; i < result.length; i++){
      scans.push(result[i].scan);
    }

    var data = {"scans" : scans};
    response.render("scans", data);
  }).catch(function(err){
    console.log(err);
    var data = {"scans" : 0, "error" : err};
    response.render("scans", data);
  });
};

exports.createGrouping = function(request, response, next){
  const title = request.body.title;
  const description = request.body.description;
  const grouping = {"title" : title, "description" : description};
  ScanGroupingDefinition.create(grouping).then(function(result){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.deleteGrouping = function(request, response, next){
  const groupingId = request.body.grouping_id;
  let condition = {"grouping_id" : groupingId};
  ScanGrouping.destroy({"where" : condition}).then(function(result){
    condition = {"id" : groupingId};
    return ScanGroupingDefinition.destroy({"where" : condition});
  }).then(function(result){
    var result = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.modifyGrouping = function(request, response, next){
  const groupingId = request.body.grouping_id;
  const title = request.body.title;
  const description = request.body.description;
  const condition = {"id" : groupingId};
  ScanGroupingDefinition.findOne({"where" : condition}).then(function(grouping){
    grouping.title = title;
    grouping.description = description;
    return grouping.save();
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

exports.renderAll = function(request, response, next){
  var scans = 0;
  Scan.findAll().then(function(result){
    scans = result;
    return ScanGroupingDefinition.findAll({"order" : ["title"]});
  }).then(function(groupings){
    let header = {"title" : "All", "description" : "These are all available scans."};
    let data = {"header" : header, "scans" : scans, "groupings" : groupings};
    response.render("scans", data);
  }).catch(function(err){
    console.log(err);
    var data = {"scans" : 0, "error" : err};
    response.render("scans", data);
  });
};

exports.renderUngrouped = function(request, response, next){
  var scans = 0;
  const query = "select * from scan where id not in (select scan_id from grouping group by scan_id);";
  connection.mimeo.query(query, {model : Scan}).then(function(result){
    scans = result;
    return ScanGroupingDefinition.findAll({"order" : ["title"]});
  }).then(function(groupings){
    let header = {"title" : "Ungrouped", "description" : "These are scans that have not been associated with any grouping."};
    let data = {"header" : header, "scans" : scans, "groupings" : groupings};
    response.render("scans", data);
  }).catch(function(err){
    console.log(err);
    var data = {"scans" : 0, "error" : err};
    response.render("scans", data);
  });
};

exports.renderGroupings = function(request, response, next){
  var groupings = [];
  var associations = [{"model" : Scan, "as" : "scan"}];
  ScanGroupingDefinition.findAll({"include" : associations, "order" : ["title"]}).then(function(result){
    var promises = [];
    for (var i = 0; i < result.length; i++){
      var header = result[i].toJSON();
      groupings.push(header);
      var conditions = {"grouping_id" : header.id};
      associations = [{"model" : Scan, "as" : "scan"}];
      var promise = ScanGrouping.findOne({"where" : conditions, "include" : associations, "order" : "rand()", "limit" : 1});
      promises.push(promise);
    }
    return Promise.all(promises);
  }).then(function(array){
    for (var i = 0; i < array.length; i++){
      if (groupings[i].scan) groupings[i].cover = groupings[i].scan;
      else groupings[i].cover = array[i] ? array[i].scan : 0;
    } 
    var data = {"groupings" : groupings};
    response.render("groupings", data);
  }).catch(function(err){
    console.log(err);
    var data = {"groupings" : 0, "error" : err};
    response.render("groupings", data);
  });
};

exports.renderGrouping = function(request, response, next){
  var groupingId = request.params.groupingId;
  var header = 0;
  var scans = 0;
  ScanGroupingDefinition.findOne({"where" : {"id" : groupingId}}).then(function(result){
    header = result.toJSON();
    return getGrouping(groupingId);
  }).then(function(result){
    scans = [];
    for (var i = 0; i < result.length; i++){
      scans.push(result[i].scan);
    }
    return ScanGroupingDefinition.findAll({"order" : ["title"]});
  }).then(function(groupings){
    var data = {"header" : header, "scans" : scans, "groupings" : groupings};
    response.render("scans", data);
  }).catch(function(err){
    console.log(err);
    var data = {"scans" : 0, "error" : err};
    response.render("scans", data);
  });
};

function getGrouping(id){
  var conditions = {"grouping_id" : id};
  var associations = [{"model" : Scan, "as" : "scan"}];
  return ScanGrouping.findAll({"where" : conditions, "include" : associations});
};

exports.displayScan = function(request, response, next){
  var display_path = "data/link_mimeo_display/" + request.query.path;
  var rotation = request.query.rotation;
  fs.readFile(display_path, function(err, data){
    if (err){
      response.writeHead(200, {"Content-Type": "text/html"});
      response.end("<span>FAILED TO LOAD SCAN</span>"); 
    }
    else{
      var buffer = new Buffer(data);
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write("<img class=\"rotated" + rotation + "\" src=\"data:scan/jpeg;base64,");
      response.write(buffer.toString("base64"));
      response.end("\"/>");
    }
  });
};

exports.downloadScan = function(request, response, next){
  var scanId = request.params.scanId;
  var filename = 0;
  var path = 0;
  var stats = 0;
  Scan.findOne({where : {"id" : scanId}}).then(function(scan){
    filename = scan.path;
    path = "data/link_mimeo_original/" + filename;
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
      "Content-disposition" : "attachment; filename=" + filename
    };
    response.writeHead(200, headers);

    var buffer = new Buffer(data);//.toString("base64");
    response.end(buffer); 
  }).catch(function(error){
    console.log(error);
    response.end(0);
  });
};

exports.rotateScan = function(request, response, next){
  var scanId = request.params.scanId;
  var orientation = 0;
  Scan.findOne({"where" : {"id" : scanId}}).then(function(scan){
    orientation = scan.orientation ? 0 : 1;
    return scan.updateAttributes({"orientation" : orientation});
  }).then(function(result){
    var result = {"orientation" : orientation};
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(data));
  });

};

exports.addScan = function(request, response, next){
  const groupingId = request.params.groupingId;
  const scanId = request.params.scanId;
  const grouping = {
    "grouping_id" : groupingId,
    "scan_id" : scanId
  };
  ScanGrouping.create(grouping).then(function(result){
    var result = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.removeScan = function(request, response, next){
  const groupingId = request.params.groupingId;
  const scanId = request.params.scanId;
  const condition = {"grouping_id" : groupingId, "scan_id" : scanId};
  ScanGrouping.destroy({"where" : condition}).then(function(result){
    var result = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.setGroupingCover = function(request, response, next){
  const groupingId = request.params.groupingId;
  const scanId = request.params.scanId;
  const condition = {"id" : groupingId};
  ScanGroupingDefinition.findOne({"where" : condition}).then(function(grouping){
    grouping.cover_id = scanId;
    return grouping.save();
  }).then(function(result){
    var result = {};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(result));
  }).catch(function(result){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};
