const connection = require("../../config/sequelize");
const Model = require("../models/models.js");
const User = Model.User;
const Recipe = Model.Recipe;

const moment = require("moment-timezone");
const sequelize = require("sequelize");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const multer = require("multer");

exports.renderRecipes = function(request, response, next){
  response.render("recipes");
};

exports.getRecipesJSON = function(request, response, next){
  const startDate = request.query.startDate;
  const endDate = request.query.endDate;
  const vendor = request.query.vendor;
  const amount = request.query.amount;

  const date_format = "YY_MMDD";
  const time_format = "HHmm";
  let start = moment(startDate + " 0000", date_format + " " + time_format);
  let end = moment(endDate + " 2359", date_format + " " + time_format);

  let condition = [];
  if (start.isValid() && end.isValid() && end.isAfter(start)){
    condition.push({"moment" : {$between : [start.toDate(), end.toDate()]}});
  }
  if (vendor && vendor.trim()){
    condition.push(sequelize.where(sequelize.fn("lower", sequelize.col("vendor")), {$like : "%" + vendor.trim().toLowerCase() + "%"}));
  }
  if (amount && amount.trim().match(/\d+(\.\d+)?\-\d+(\.\d+)?/)){
    const range = amount.trim().split("-");
    const min = range[0], max = range[1];
    if (min <= max) condition.push({"amount" : {$between : [min, max]}});
  }
  
  Recipe.findAll({where : {$and : condition}, order : ["moment"]}).then(function(result){
    let map = {};
    if (result && result.length){
      for (let i = 0; i < result.length; i++){
        const row = result[i];
        const rowId = "recipesrowid_" + row.id;
        const id = row.id;
        const vendor = row.vendor;
        const amount = row.amount.toFixed(2);
        const moment = row.moment;
        const date = row.moment ? getZeroFormat(row.moment, false) : "";
        const path = row.path;
        const content_type = row.content_type;
        map[rowId] = {rowId, id, vendor, amount, date, path, content_type};
      }
    }
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify(map));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end({});
  });
};

exports.createRecipe = function(request, response, next){
  const vendor = request.body.vendor;
  const amount = request.body.amount;
  const date = moment(request.body.date, "YY_MMDD").toDate();

  getNextFileName().then(function(path){
    const content_type = "pdf";
    return Recipe.create({vendor, amount, moment : date, path, content_type});
  }).then(function(recipe){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({message : "Recipe saved.", recipe}));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
};

exports.updateRecipe = function(request, response, next){
  const {id, vendor, amount, date} = request.body;
  Recipe.findOne({"where" : {id}}).then(function(recipe){
    recipe.vendor = vendor;
    recipe.amount = amount;
    recipe.moment = moment(date, "YY_MMDD").toDate();
    return recipe.save();
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"message" : "Recipe updated."}));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
};

