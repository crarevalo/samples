var Model = require("../models/models.js");
var User = Model.User;
var Profile = Model.Profile;
var Numbers = Model.Numbers;
var Location = Model.Location;
var Note = Model.Note;
var Text = Model.Text;
var Log = Model.Log;
var LogKeyword = Model.LogKeyword;
var Email = Model.Email;
var EmailRecipient = Model.EmailRecipient;
var EmailKeyword = Model.EmailKeyword;
var EmailRelevance = Model.EmailRelevance;
var moment = require("moment");
var connection = require("../../config/sequelize");
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var logger = require("../../config/logger");

exports.renderLocations = function(request, response, next){
  var timezone = request.session.timezone;
  var search_mode = request.body.search_mode;

  if (!search_mode){
    response.render("locations");
    return;
  }

  if (search_mode === "1"){
    var username = request.body.username;
    var user_id = 0;
    var info = "[USERNAME: " + username + "] [LAST LOCATION]";
    
    User.findOne({where : {"username" : username}}).then(function(user){
      user_id = user.id;
    }).then(function(){
      var query = "SELECT * FROM location WHERE user_id = ? AND moment = (SELECT MAX(moment) FROM location WHERE user_id = ?)";
      return connection.happenstance.query(query, {replacements : [user_id, user_id], model : Location});
    }).then(function(locations){
      var formatted = [];
      for (var i = 0; i < locations.length; i++){
        formatted.push(formatLocation(locations[i], timezone));
      }
      var data = {"locations" : formatted, "last_location" : formatted[0], "info" : info};
      response.writeHead(200, {"Content-Type" : "application/json"});
      response.end(JSON.stringify(data));
    }).catch(function(err){
      console.log(err);
      var data = {"locations" : 0, "error" : err};
      response.writeHead(200, {"Content-Type" : "application/json"});
      response.end(JSON.stringify(data));
    });
  }
  else if (search_mode === "0"){
    var date_start = request.body.date_start;
    var time_start = request.body.time_start;
    if (!time_start) time_start = "0000";
    var date_end = request.body.date_end;
    var time_end = request.body.time_end;
    if (!time_end) time_end = "2359";

    var date_format = "YY_MMDD";
    var time_format = "HHmm";
    var start = moment.tz(date_start + " " + time_start, date_format + " " + time_format, timezone);
    var end = moment.tz(date_end + " " + time_end, date_format + " " + time_format, timezone);

    var username = request.body.username;
    var user_id = 0;
    
    var info = "[USERNAME: " + username + "] ";
    var condition = {};
    if (start.isValid() && end.isValid() && end.isAfter(start)){
      info += "[RANGE: " + date_start + "_XX" + time_start + " - " + date_end + "_XX" + time_end + "] ";
      condition["moment"] = {between : [start.toDate(), end.toDate()]};
    }
    else{
      condition["moment"] = {between : [0, 0]};
    }

    User.findOne({where : {"username" : username}}).then(function(user){
      user_id = user.id;
      condition["user_id"] = user_id;
    }).then(function(){
      return Location.findAll({where : condition, order : "moment"});
    }).then(function(locations){
      var formatted = [];
      for (var i = 0; i < locations.length; i++){
        formatted.push(formatLocation(locations[i], timezone));
      }
      var data = {"locations" : formatted, "info" : info};
      response.writeHead(200, {"Content-Type" : "application/json"});
      response.end(JSON.stringify(data));
    }).catch(function(err){
      console.log(err);
      var data = {"locations" : 0, "error" : err};
      response.writeHead(200, {"Content-Type" : "application/json"});
      response.end(JSON.stringify(data));
    });

  }
  else if (search_mode === "2"){
    var username = request.body.username;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    var user_id = 0;
    var info = "[USERNAME: " + username + "] [LATITUDE; " + latitude + "] [LONGITUDE: " + longitude + "] ";

    User.findOne({where : {"username" : username}}).then(function(user){
      user_id = user.id;
    }).then(function(){
      var query = "SELECT moment, latitude, longitude, ";
      query += "111.111 * DEGREES(ACOS(LEAST(COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(? - longitude)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude)), 1.0))) AS distance ";
      query += "FROM location WHERE user_Id = ? HAVING distance < 2;";
      return connection.happenstance.query(query, {replacements : [latitude, longitude, latitude, user_id], model : Location});
    }).then(function(locations){
      var map = [];
      for (var i = 0; i < locations.length; i++){
        var date = getZeroFormat(locations[i].moment, false, timezone);
        map[date] = 1;
      }
      var dates = Object.keys(map);
      if (dates) dates.sort();
      var data = {"dates" : dates, "info" : info};
      response.writeHead(200, {"Content-Type" : "application/json"});
      response.end(JSON.stringify(data));
    }).catch(function(err){
      console.log(err);
      var data = {"dates" : 0, "error" : err};
      response.writeHead(200, {"Content-Type" : "application/json"});
      response.end(JSON.stringify(data));
    });

  }
  else{
    var data = {"locations" : 0};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }
};

function formatLocation(location, timezone){
  if (!location) return 0;
  var obj = {};
  obj.user_id = location.user_id;
  obj.moment = location.moment;
  obj.accuracy = location.accuracy;
  obj.latitude = location.latitude;
  obj.longitude = location.longitude;
  obj.altitude = location.altitude;
  obj.speed = location.speed;
  obj.bearing = location.bearing;
  obj.comment = location.comment;
  obj.datetime = getZeroFormat(location.moment, true, timezone);
  return obj;
}

exports.renderNotes = function(request, response, next){
  var timezone = request.session.timezone;
  var user_id = request.body.user_id;
  var search_term = request.body.search_term;

  var date_start = request.body.date_start;
  var time_start = request.body.time_start;
  if (!time_start) time_start = "0000";
  var date_end = request.body.date_end;
  var time_end = request.body.time_end;
  if (!time_end) time_end = "2359";

  if (!search_term && !date_start && !date_end){
    response.render("notes");
    return;
  }

  var date_format = "YY_MMDD";
  var time_format = "HHmm";
  var start = moment.tz(date_start + " " + time_start, date_format + " " + time_format, timezone);
  var end = moment.tz(date_end + " " + time_end, date_format + " " + time_format, timezone);

  var info = "";
  var condition = {};
  if (start.isValid() && end.isValid() && end.isAfter(start)){
    info += "[RANGE: " + date_start + "_XX" + time_start + " - " + date_end + "_XX" + time_end + "] ";
    condition["moment"] = {between : [start.toDate(), end.toDate()]};
  }
  if (search_term){
    info += "[KEYWORD: " + search_term + "] ";
    condition["content"] = {"$like" : "%" + search_term + "%"};
  }

  Note.findAll({where : condition, order : "moment"}).then(function(notes){
    var formatted = [];
    for (var i = 0; i < notes.length; i++){
      var note = {};
      note.moment = notes[i].moment;
      note.datetime = getZeroFormat(notes[i].moment, true, timezone);
      note.content = notes[i].content;
      formatted.push(note);
    }
    var data = {"notes" : formatted, "info" : info};
    request.session.notes = formatted;
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    request.session.notes = 0;
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }); 
  
};

exports.editNote = function(request, response, next){
  var user_id = request.body.user_id;
  var action = request.body.edit_action;
  var index = request.body.edit_index;
  var content = request.body.edit_content;
  var notes = request.session.notes;
  var note = notes[+index];
  Note.find({where : {"moment" : note.moment}}).then(function(target){
    if (target){
      if (action === "update"){
        target.content = content;
        return target.save();
      }
      else if (action === "delete"){
        return target.destroy();
      }
    }
  }).then(function(result){
    if (action === "update"){
      note.content = content;
    }
    else if (action === "delete"){
      notes.splice(+index, 1);
    }
    var data = {"notes" : notes};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.renderTexts = function(request, response, next){
  var timezone = request.session.timezone;
  var user_id = request.body.user_id;
  var number = request.body.number;

  var date_start = request.body.date_start;
  var time_start = request.body.time_start;
  if (!time_start) time_start = "0000";
  var date_end = request.body.date_end;
  var time_end = request.body.time_end;
  if (!time_end) time_end = "2359";

  if (!number && !date_start && !date_end){
    response.render("texts");
    return;
  }

  var date_format = "YY_MMDD";
  var time_format = "HHmm";
  var start = moment.tz(date_start + " " + time_start, date_format + " " + time_format, timezone);
  var end = moment.tz(date_end + " " + time_end, date_format + " " + time_format, timezone);

  var info = "";
  var condition = {};
  if (start.isValid() && end.isValid() && end.isAfter(start)){
    info += "[RANGE: " + date_start + "_XX" + time_start + " - " + date_end + "_XX" + time_end + "] ";
    condition["moment"] = {between : [start.toDate(), end.toDate()]};
  }
  if (number){
    info += "[NUMBER: " + number + "] ";
    condition["number"] = number;
  }
 
  let numberMap = {};
  let association = [{"model" : Profile, "as" : "profile"}];
  Numbers.findAll({"include" : association}).then(function(numbers){
    if (numbers && numbers.length){
      for (let i = 0; i < numbers.length; i++){
        let record = numbers[i];
        let profile = record.profile;
        numberMap["" + record.number] = profile.first_name + " " + profile.last_name;
      }
    }
    return Text.findAll({where : condition, order : "moment"});
  }).then(function(texts){
    var formatted = [];
    for (var i = 0; i < texts.length; i++){
      var text = {};
      text.moment = getZeroFormat(texts[i].moment, true, timezone);
      text.number = texts[i].number;
      text.name = numberMap[text.number] ? numberMap[text.number] : text.number;
      text.direction = (texts[i].direction === 1) ? "received" : "sent";
      text.message = texts[i].message;
      formatted.push(text);
    }
    var data = {"texts" : formatted, "info" : info};
    request.session.texts = formatted;
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    request.session.texts = 0;
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.renderLogs = function(request, response, next){
  var timezone = request.session.timezone;
  var user_id = request.body.user_id;
  var search_term = request.body.search_term;

  var date_start = request.body.date_start;
  var time_start = request.body.time_start;
  if (!time_start) time_start = "0000";
  var date_end = request.body.date_end;
  var time_end = request.body.time_end;
  if (!time_end) time_end = "2359";

  if (!search_term && !date_start && !date_end){
    response.render("logs");
    return;
  }

  var date_format = "YY_MMDD";
  var time_format = "HHmm";
  var start = moment.tz(date_start + " " + time_start, date_format + " " + time_format, timezone);
  var end = moment.tz(date_end + " " + time_end, date_format + " " + time_format, timezone);

  var info = "";
  var condition = {};
  if (start.isValid() && end.isValid() && end.isAfter(start)){
    info += "[RANGE: " + date_start + "_XX" + time_start + " - " + date_end + "_XX" + time_end + "] ";
    condition["edit_end"] = {between : [start.toDate(), end.toDate()]};
  }
  var association = [];
  if (search_term){
    info += "[KEYWORD: " + search_term + "] ";
    association = [{"attributes" : [], "model" : LogKeyword, "where" : {"term" : search_term}}];
  }
 
  Log.findAll({include : association, where : condition, order : "edit_end"}).then(function(logs){
    var formatted = [];
    for (var i = 0; i < logs.length; i++){
      var log = {};
      log.id = logs[i].id;
      log.type_id = logs[i].type_id;
      log.title = logs[i].title;
      log.description = logs[i].description;
      log.content_start = getZeroFormat(logs[i].content_start, true, timezone);
      log.content_end = getZeroFormat(logs[i].content_end, true, timezone);
      log.edit_start = getZeroFormat(logs[i].edit_start, true, timezone);
      log.edit_end = getZeroFormat(logs[i].edit_end, true, timezone);
      log.path = logs[i].path;
      formatted.push(log);
    }
    var data = {"logs" : formatted, "info" : info};
    request.session.logs = formatted;
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  }).catch(function(error){
    request.session.logs = 0;
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
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

exports.displayLog = function(request, response, next){
  var log_id = request.query.log_id;
  var path = "data/link_logs/" + request.query.path;
  var saved_keywords = 0;
  var saved_html = 0;
  var saved_xml = 0;
  LogKeyword.findAll({where : {"log_id" : log_id}, order : "term"}).then(function(keywords){
    saved_keywords = keywords;
    return keywords;
  }).then(function(keywords){
    return Log.findOne({where : {id : log_id}});
  }).then(function(log){
    saved_html = getLogHeaderHTML(log, "test", 0, 0, saved_keywords);
    return fs.readFileAsync(path);
  }).then(function(data){
    saved_xml = new Buffer(data).toString();
    return fs.readFileAsync("public/hindsight/log.xsl");
  }).then(function(data){
    var xsl = new Buffer(data).toString();
    var json = {"header" : saved_html, "xml" : saved_xml, "xsl" : xsl};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(json));
  }).catch(function(err){
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Error displaying log."}))
  });
};

function getLogHeaderHTML(log, type, locations, relevance, keywords){
  if (!log) return "";
  var html = "";
  html += "<div class=\"log_header_section\">";
  html += "<div>";
  html += "<span id=\"log_title\">" + log.title + "</span>";
  html += "<span class=\"log_type\">" + type + "</span>";
  html += "</div>";
  html += "<div>";
  html += "<span id=\"log_description\">" + log.description + "</span>";
  html += "</div>";
  html += "<div>";
  html += "<span class=\"date_header\">content</span>";
  html += "<span class=\"date_content\">" + "" + "</span>";
  html += "<span>|</span>";
  html += "<span class=\"date_header\">written</span>";
  html += "<span class=\"date_content\">" + "" + "</span>";
  html += "</div>";

  if (keywords && keywords.length){
    html += "<div class=\"log_header_section\">";
    html += "<span class=\"header\">Keywords:</span>";
    for (var i = 0; i < keywords.length; i++){
      html += "<span class=\"keyword\">" + keywords[i].term + "</span>";
    }
    html += "</div>";
  }



  return html;
}

function getLocations(log_id){
  
}

function getRelevance(log_id){

}

exports.renderEmails = function(request, response, next){
  var user_id = request.body.user_id;
  var date_start = request.body.date_start;
  var time_start = request.body.time_start;
  if (!time_start) time_start = "0000";
  var date_end = request.body.date_end;
  var time_end = request.body.time_end;
  if (!time_end) time_end = "2359";

  var date_format = "YY_MMDD";
  var time_format = "HHmm";
  var start = moment(date_start + " " + time_start, date_format + " " + time_format);
  var end = moment(date_end + " " + time_end, date_format + " " + time_format);
  var isValidRange = start.isValid() && end.isValid() && end.isAfter(start);

  var keyword = request.body.keyword;

  if (isValidRange || keyword){
    var association = [];
    if (keyword) association = [{"attributes" : [], "model" : EmailKeyword, "where" : {"term" : keyword}}];
    var condition = {};
    if (isValidRange) condition = {"moment" : {"between" : [start.toDate(), end.toDate()]}};
    Email.findAll({"include" : association, "where" : condition, order : "moment"}).then(function(results){
      if (results){
        for (var i = 0; i < results.length; i++){
          var email = results[i];
          if (!email) continue;
          email.moment_display = getZeroFormat(email.moment, true);
        }
      }
      var data = {"results" : results};
      response.render("emails", data);
    }).catch(function(err){
      console.log(err);
      var data = {"results" : 0, "error" : err};
      response.render("emails", data);
    });
  }
  else{
    var data = {"results" : 0};
    response.render("emails", data);
  }
};


exports.serviceLocationPOST = function(request, response, next){
  var data = JSON.parse(request.body.data);

  var username = data.username;
  var accuracy = data.accuracy;
  var latitude = data.latitude;
  var longitude = data.longitude;
  var altitude = data.altitude;
  var speed = data.speed;
  var bearing = data.bearing;
  var comment = data.comment;

  var timestamp = moment(+data.timestamp);
  if (!timestamp.isValid()){
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Invalid timestamp."}));
    return; 
  }

  var userId = 0;
  User.findOne({where : {"username" : username}}).then(function(user){
    userId = user.id;
    var location = Location.build({"user_id" : userId, "moment" : timestamp, "accuracy" : accuracy, "latitude" : latitude, "longitude" : longitude, "altitude" : altitude, "speed" : speed, "bearing" : bearing, "comment" : comment});
    return location.save();
  }).then(function(){
    return Location.count({where : {"user_id" : userId, "moment" : timestamp}});
  }).then(function(count){
    if (count == 1){
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"message" : "Location successfully saved."}));
    }
    else{
      response.writeHead(500, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"message" : "Failed to save location."}));
    }
  }).catch(function(error){
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
}

exports.serviceNotePOST = function(request, response, next){
  var data = JSON.parse(request.body.data);
  var timestamp = moment(+data.timestamp);
  if (!timestamp.isValid()){
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : "Invalid timestamp."}));
    return;
  }
  var content = data.content;
  var note = Note.build({"moment" : timestamp, "content" : content});
  note.save().then(function(){
    return Note.count({where : {"moment" : timestamp, "content" : content}});
  }).then(function(count){
    if (count == 1){
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"message" : "Note successfully posted."}));
    }
    else{
      response.writeHead(500, {"Content-Type": "application/json"});
      response.end(JSON.stringify({"message" : "Failed to post note."}));
    }
  }).catch(function(error){
    response.writeHead(500, {"Content-Type": "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
}
