var fs = require("fs");
var Model = require("../models/models.js");
var Photo = Model.Photo;
var moment = require("moment");
var exif = require("exif-parser");
var connection = require("../../config/sequelize");

exports.renderPhotos = function(request, response, next){
  var user_id = request.body.user_id;
  var date_start = request.body.date_start;
  var time_start = request.body.time_start;
  if (!time_start) time_start = "0000";
  var date_end = request.body.date_end;
  var time_end = request.body.time_end;
  if (!time_end) time_end = "2359";

  if (!date_start && !date_end){
    response.render("photos"); 
    return;
  } 

  var date_format = "YY_MMDD";
  var time_format = "HHmm";
  var start = moment(date_start + " " + time_start, date_format + " " + time_format);
  var end = moment(date_end + " " + time_end, date_format + " " + time_format);

  var info = "";
  var condition = {};
  if (start.isValid() && end.isValid() && end.isAfter(start)){
    info += "[RANGE: " + date_start + "_XX" + time_start + " - " + date_end + "_XX" + time_end + "] ";
    condition["moment"] = {between : [start.toDate(), end.toDate()]};
  }

  Photo.findAll({where : condition, order : "moment"}).then(function(photos){
    var rows = 0;
    if (photos && photos.length) rows = Math.ceil(photos.length / 5);
    var data = {"photos" : photos, "rows" : rows, "info" : info};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(err){
    console.log(err);
    var data = {"photos" : 0, "error" : err};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.displayPhoto = function(request, response, next){
  var display_path = "data/link_display/" + request.query.path;
  var rotation = request.query.rotation;
  fs.readFile(display_path, function(err, data){
    if (err){
      response.writeHead(200, {"Content-Type": "text/html"});
      response.end("<span>FAILED TO LOAD IMAGE</span>"); 
    }
    else{
      var buffer = new Buffer(data);
      var parser = exif.create(buffer);
      var result = parser.parse();
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write("<img class=\"rotated" + rotation + "\" src=\"data:image/jpeg;base64,");
      response.write(buffer.toString("base64"));
      response.end("\"/>");
    }
  });
};

exports.displayEXIF = function(request, response, next){
  var display_path = "data/link_display/" + request.query.path;
  fs.readFile(display_path, function(err, data){
    if (err){
      response.writeHead(200, {"Content-Type": "text/html"});
      response.end("<span>FAILED TO LOAD EXIF DATA</span>");
    }
    else{
      var buffer = new Buffer(data);
      var parser = exif.create(buffer);
      var result = parser.parse();
      var tags = result ? result.tags : 0;
      var html = "";
      if (result && tags){
        for (var key in tags){
          if (!tags.hasOwnProperty(key)) continue;
          html += "<div class=\"exif\"><span class=\"header\">" + key + ":&nbsp;</span><span class=\"content\">" + tags[key] + "</span></div>\n";
        }
      }
      response.writeHead(200, {"Content-Type": "text/html"});
      response.end(html);
    }
  });
};

exports.downloadPhoto = function(request, response, next){
  var photoId = request.params.photoId;
  var filename = 0;
  var path = 0;
  Photo.findOne({"where" : {"id" : photoId}}).then(function(photo){
    filename = photo.path;
    path = "data/link_blueprint_original/" + filename;
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

