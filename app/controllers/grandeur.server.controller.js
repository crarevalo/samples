const connection = require("../../config/sequelize");
const Model = require("../models/models.js");
const User = Model.User;
const Receipt = Model.Receipt;

const moment = require("moment-timezone");
const sequelize = require("sequelize");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const multer = require("multer");

exports.renderReceipts = function(request, response, next){
  response.render("receipts");
};

exports.getReceiptsJSON = function(request, response, next){
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
  
  Receipt.findAll({where : {$and : condition}, order : ["moment"]}).then(function(result){
    let map = {};
    if (result && result.length){
      for (let i = 0; i < result.length; i++){
        const row = result[i];
        const rowId = "receiptsrowid_" + row.id;
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

exports.getFileData = function(request, response, next){
  const location = request.query.filename;
  const path = "data/link_grandeur/" + location;
  fs.readFileAsync(path).then(function(data){
    const buffer = new Buffer(data);//.toString("base64");
    response.end(buffer);
  }).catch(function(error){
    console.log(error);
    response.end(0);
  });
}

exports.createReceipt = function(request, response, next){
  const vendor = request.body.vendor;
  const amount = request.body.amount;
  const date = moment(request.body.date, "YY_MMDD").toDate();

  getNextFileName().then(function(path){
    const content_type = "pdf";
    return Receipt.create({vendor, amount, moment : date, path, content_type});
  }).then(function(receipt){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({message : "Receipt saved.", receipt}));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
};

exports.updateReceipt = function(request, response, next){
  const {id, vendor, amount, date} = request.body;
  Receipt.findOne({"where" : {id}}).then(function(receipt){
    receipt.vendor = vendor;
    receipt.amount = amount;
    receipt.moment = moment(date, "YY_MMDD").toDate();
    return receipt.save();
  }).then(function(){
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"message" : "Receipt updated."}));
  }).catch(function(error){
    console.log(error);
    response.writeHead(200, {"Content-Type" : "application/json"});
    response.end(JSON.stringify({"error" : error}));
  });
};

exports.uploadFile = function(request, response, next){
  const storage = multer.diskStorage({
    destination : function(request, file, callback){
      callback(null, "data/link_grandeur");
    },
    filename : function(request, file, callback){
      const location = request.body.location;
      callback(null, location);
    }
  });

  const upload = multer({ storage : storage}).single("upload_file");
  upload(request, response, function(error){
    if (error){
      return response.end("Error uploading file.");
    }
    response.end("File is uploaded");
  });
};

function getNextFileName(){
  return Receipt.max("path").then(function(path){
    const name = path.replace(/\..+/, "");
    const value = parseInt(name);
    const filename = ("" + (value + 1)).padStart(8, "0") + ".pdf";
    return filename;
  });
}

exports.renderMarkets = function(request, response, next){
  response.render("markets");
};

function getZeroFormat(str, include_time, timezone){
  let m = moment(str);
  if (timezone) m = m.tz(timezone);
  const format = "YY_MMDD" + (include_time ? "_ddHHmm" : "");
  let display = m.format(format);
  if (display) display = display.toUpperCase();
  return display;
};

