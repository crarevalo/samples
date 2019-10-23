var moment = require("moment");

exports.renderIndex = function(request, response, next){
  response.render("chat");
};

function generateKey(...parameters){
  if (!parameters) return "";
  let key = "key";
  for (let param of parameters){
    key += "_" + param
  }
  return key;
}

function generateKeyFromMessage(message){
  return message ? generateKey(message.username, message.timestamp) : generateKey();
}

function getDateTime(include_time, timezone){
  var m = moment();
  if (timezone) m = m.tz(timezone);
  var format = "YY_MMDD" + (include_time ? "_ddHHmm" : "");
  var display = m.format(format);
  if (display) display = display.toUpperCase();
  return display;
};

exports.handleSocket = function(io, socket){
  const initMessage = {
    type : "status",
    content : "connected",
    timestamp : +(new Date()),
    created : getDateTime(true),
    username : socket.request.user.username
  };
  initMessage.key = generateKeyFromMessage(initMessage);

  io.emit("chatMessage", initMessage);

  socket.on("chatMessage", function(message){
    message.type = "message";
    message.timestamp = +(new Date());
    message.created = getDateTime(true);
    message.username = socket.request.user.username;
    message.key = generateKeyFromMessage(message);
    io.emit("chatMessage", message);
  });

  socket.on("disconnect", function(){
    const closeMessage = {
      type : "status", 
      content : "disconnected",
      timestamp : +(new Date()),
      created : getDateTime(true),
      username : socket.request.user.username
    };
    closeMessage.key = generateKeyFromMessage(closeMessage);

    io.emit("chatMessage", closeMessage);
  });
};
