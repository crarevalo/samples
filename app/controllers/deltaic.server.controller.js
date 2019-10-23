var fs = require("fs");
var Model = require("../models/models.js");
var TreeProfile = Model.TreeProfile;
var TreeUnion = Model.TreeUnion;
var TreeChild = Model.TreeChild;
var connection = require("../../config/sequelize");

exports.renderSearch = function(request, response, next){
  var data = {"mode" : "search"};
  response.render("tree", data);
};

exports.loadData = function(request, response, next){
  loadMaps(request).then(function(){
    var profiles = request.session.deltaic.profiles;
    var unions = request.session.deltaic.unions;
    var map = {};
    for (var unionId in unions){
      var union = unions[unionId];
      var label = getUnionLabel(profiles, union);
      map["" + unionId] = label;
    }
    var json = {"unions" : map};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(json));
  }).catch(function(error){
    console.log(error);
    var data = {"error" : error};
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(data));
  });
};

exports.renderTree = function(request, response, next){
  var unionId = request.params.unionId;
  var data = {"mode" : "view", "union_id" : unionId};
  response.render("tree", data);
};

exports.loadTree = function(request, response, next){
  var unionId = request.query.union_id;
  maxDepth = 0;
  breadths = {};
  var result = getTree(request.session, "{", unionId, 0); //282, 320
  var maxBreadth = 0;
  for (var depth in breadths){
    maxBreadth = Math.max(maxBreadth, breadths[depth]);
  }
//  result = result.trim();
//  if (result.endsWith(",")) result = result.substring(0, result.length - 1);
  var object = JSON.parse(result);
  var json = {"tree_data" : object, "tree_breadth" : maxBreadth, "tree_depth" : maxDepth};
  response.writeHead(200, {"Content-Type" : "application/json"});
  response.end(JSON.stringify(json));
};

// returns promise
function loadMaps(request){
  if (request.session.deltaic) return Promise.resolve(0);
  return getProfiles().then(function(map){
    request.session.deltaic = {};
    request.session.deltaic.profiles = map;
    return getUnions();
  }).then(function(map){
    request.session.deltaic.unions = map;
    var profileUnionMap = getProfileUnionMap(map);
    request.session.deltaic.profileUnionMap = profileUnionMap;
    return getChildren();
  }).then(function(map){
    request.session.deltaic.children = map;
    return 1;
  });
}

var maxDepth = 0;
var breadths = {};

// returns the string representation of a subtree
function getTree(session, output, unionId, depth){
  depth = depth + 1;
  maxDepth = Math.max(maxDepth, depth);
  incrementBreadth(depth);

  var profiles = session.deltaic.profiles;
  var unions = session.deltaic.unions;
  var profileUnionMap = session.deltaic.profileUnionMap;
  var children = session.deltaic.children;

  var union = unions["" + unionId];
  var label = getUnionLabel(profiles, union);
  output += "\"name\" : \"" + label + "\"";
  var profileIds = children["" + union.id];
  if (profileIds && profileIds.length){
    output += ", \"children\" : [";
    for (var i = 0; i < profileIds.length; i++){
      if (i > 0) output += ", ";
      var profileId = profileIds[i];
      var union = profileUnionMap["" + profileId];
      if (union){
        var subUnionId = union.id;
        output += getTree(session, "{", subUnionId, depth);
      }
      else{
        var profileId = profileIds[i];
        var profile = profiles["" + profileId];
        var label = getProfileLabel(profile);
        output += "{\"name\" : \"" + label + "\"}";
        incrementBreadth(depth + 1);
      }
    }
    output += "]";
  }
  return output + "}";
};

function incrementBreadth(depth){
  if (breadths["" + depth]) breadths["" + depth] += 1;
  else breadths["" + depth] = 1;
}

// returns promise
function getProfiles(){
  return TreeProfile.findAll().then(function(profiles){
    var map = {};
    for (var i = 0; i < profiles.length; i++){
      var profile = profiles[i];
      map["" + profile.id] = profile;
    }
    return map;
  });
};

// returns promise
function getUnions(){
  return TreeUnion.findAll().then(function(unions){
    var map = {};
    for (var i = 0; i < unions.length; i++){
      var union = unions[i];
      map["" + union.id] = union;
    }
    return map;
  });
};

// returns map from profile id -> union
function getProfileUnionMap(unions){
  var map = {};
  for (var unionId in unions){
    var union = unions[unionId];
    var profileId = union.profile_id;
    map["" + profileId] = union;
  }
  return map;
};

// returns promise
function getChildren(){
  return TreeChild.findAll({"order" : ["partnership_id", "rank"]}).then(function(results){
    var map = {};
    for (var i = 0; i < results.length; i++){
      var child = results[i];
      var unionId = child.partnership_id;
      var profileId = child.profile_id;
      if (map["" + unionId]){
        map["" + unionId].push(profileId);
      }
      else{
        map["" + unionId] = [profileId];
      }
    }
    return map;
  });
};

// returns string
function getProfileLabel(profile){
  if (!profile) return "";
  var label = "";
  if (profile.title) label += profile.title + " ";
  if (profile.first) label += profile.first + " ";
  if (profile.middle) label += profile.middle + " ";
  if (profile.last) label += profile.last + " ";
  if (profile.suffix) label += profile.suffix;
  return label.trim();
}

function getUnionLabel(profiles, union){
  if (!union) return "";
  var label = "";

  var profileId = union.profile_id;
  var profile = profiles["" + profileId];
  if (!profile) return "";
  var profileLabel = getProfileLabel(profile);
  if (profileLabel) label = profileLabel;

  var partnerId = union.partner_id;
  if (profileId === partnerId) return label;
  var partner = profiles["" + partnerId];
  if (partner){
    var partnerLabel = getProfileLabel(partner);
    if (partnerLabel) label += " | " + partnerLabel;
  }
  return label;
};

