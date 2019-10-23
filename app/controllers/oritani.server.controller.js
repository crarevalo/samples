var fs = require("fs");
var Model = require("../models/models.js");
var Video = Model.Video;
var connection = require("../../config/sequelize");

exports.renderVideos = function(request, response, next){
  Video.findAll({"order" : ["start_year", "start_month", "start_date"]}).then(function(result){
    var years = [];
    var map = {};
    for (var i = 0; i < result.length; i++){
      var video = result[i];
      var year = video.start_year;
      if (!year) year = "Missing Date Information";
      if (map["" + year]){
        var array = map["" + year];
        array.push(video);
      }
      else{
        var array = [];
        array.push(video);
        map["" + year] = array;
        years.push(year);
      }
    }
    years.sort();
    var data = {"years" : years, "map" : map};
    response.render("videos", data);
  }).catch(function(err){
    console.log(err);
    var data = {"error" : err};
    response.render("videos", data);
  });
};

exports.getData = function(request, response, next){
  var location = request.query.filename;
  var path = "data/link_oritani/" + location;
  var stat = fs.statSync(path);
  var total = stat.size;
  if (request.headers['range']){
    var range = request.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = (end-start) + 1;

    var file = fs.createReadStream(path, {"start" : start, "end" : end});
    response.writeHead(206, {"Content-Range" : "bytes " + start + "-" + end + "/" + total, "Accept-Ranges" : "bytes", "Content-Length" : chunksize, "Content-Type": "video/mp4"});
    file.pipe(response);
  }
  else{
    console.log("ALL: " + total);
    response.writeHead(200, {"Content-Length" : total, "Content-Type" : "video/mp4"});
    fs.createReadStream(path).pipe(response);
  }
}

