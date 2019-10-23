jQuery(document).ready(function(){
  jQuery(function(){
    var options = {
      defaultDate : "+1w",
      changeMonth : true,
      changeYear : true,
      numberOfMonths : 1,
      dateFormat : "y_mmdd"
    };
    var dateFormat = "y_mmdd";
    var from = jQuery("#date_start").datepicker(options).on("change", function(){
      to.datepicker("option", "minDate", getDate(this));
    });
    var to = jQuery("#date_end").datepicker(options).on("change", function(){
      from.datepicker("option", "maxDate", getDate(this));
    });
 
    function getDate(element){
      var date;
      try{
        date = jQuery.datepicker.parseDate(dateFormat, element.value);
      }
      catch(error){
        date = null;
      }
      return date;
    }
  });

  var width = jQuery(window).width();
  var height = jQuery(window).height();
  jQuery("#map_canvas").width(width - 20);
  jQuery("#map_canvas").height(height * 0.90);
});

function buildResultTable(result){
  var target = jQuery("#map_canvas");
  target.empty();
  var table = document.createElement("TABLE");
  {
    var row = table.insertRow(0);
    var cell0 = row.insertCell(0);
    cell0.innerHTML = "<span>Date</span>";
  }
  for (var i = 0; i < result.length; i++){
    var row = table.insertRow(i + 1);
    var cell0 = row.insertCell(0);
    cell0.innerHTML = "<span>" + result[i] + "</span>";
  }
  target.append(table);  
}

function buildResultMap(locations){
  var latlng = new google.maps.LatLng(40.94220653, -73.99416295);

  if (locations && locations.length){
    var last_found_location = locations[locations.length - 1];
    latlng = new google.maps.LatLng(last_found_location.latitude, last_found_location.longitude);
  }

  jQuery("#map_canvas").empty();
  var options = {
    "zoom" : 12,
    "center" : latlng,
    "mapTypeId" : google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), options);

  for (var i = 0; i < locations.length; i++){
    var location = locations[i];
    var coordinates = new google.maps.LatLng(location.latitude, location.longitude);
    var marker  = new google.maps.Marker({"position" : coordinates, "map" : map, "title" : location.datetime});

    var message = createMessage(location);
    var info = new google.maps.InfoWindow({content : message});
    marker.addListener("click", getMarkerCallback(map, marker, info));
  }
}

function createMessage(location){
  var str = "";
  str += "<div><b>Timestamp:</b>&nbsp;" + location.datetime + "</div>";
  str += "<div><b>Accuracy:</b>&nbsp;" + location.accuracy + "</div>";
  str += "<div><b>Latitude:</b>&nbsp;" + location.latitude + "</div>";
  str += "<div><b>Longitude:</b>&nbsp;" + location.longitude + "</div>";
  str += "<div><b>Altitude:</b>&nbsp;" + location.altitude + "</div>";
  str += "<div><b>Speed:</b>&nbsp;" + location.speed + "</div>";
  str += "<div><b>Bearing:</b>&nbsp;" + location.bearing + "</div>";
  return str;
}

function getMarkerCallback(map, marker, info){
  return function(){
    info.open(map, marker);
  };
}

var dialogs = {};
jQuery(function(){
  dialogs["search"] = jQuery("#search").dialog(buildDialogProperties({"width" : 600, "height" : 250}));
});

function openSearchDialog(){
  var options = {};
  var beforeOpen = function(){};
  openDialog("search", options, beforeOpen);
}

function searchLocations(){
  var username = jQuery("#username").val();
  var date_start = jQuery("#date_start").val();
  var time_start = jQuery("#time_start").val();
  var date_end = jQuery("#date_end").val();
  var time_end = jQuery("#time_end").val();
  var search_mode = "0";
  var params = {"username" : username, "date_start" : date_start, "time_start" : time_start, "date_end" : date_end, "time_end" : time_end, "search_mode" : search_mode};
  jQuery.post("/hindsight/locations", params, function(data){
    if (data.error) return;
    var info = data.info;
    jQuery("#search_info").text(info);
    var result = data.locations;
    buildResultMap(result);
  });
}

function showLastLocation(){
  var username = jQuery("#username").val();
  var search_mode = "1";
  var params = {"username" : username, "search_mode" : search_mode};
  jQuery.post("/hindsight/locations", params, function(data){
    if (data.error) return;
    var info = data.info;
    jQuery("#search_info").text(info);
    var result = data.locations;
    buildResultMap(result);
  });
}

function showDatesAtLocation(){
  var username = jQuery("#username").val();
  var latitude = jQuery("#latitude").val();
  var longitude = jQuery("#longitude").val();
  var search_mode = "2";
  var params = {"username" : username, "latitude" : latitude, "longitude" : longitude, "search_mode" : search_mode};
  jQuery.post("/hindsight/locations", params, function(data){
    if (data.error) return;
    var info = data.info;
    jQuery("#search_info").text(info);
    var result = data.dates
    buildResultTable(result);
  });
}


