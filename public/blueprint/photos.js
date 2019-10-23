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
});

var dialogs = {};
jQuery(function(){
  dialogs["search"] = jQuery("#search").dialog(buildDialogProperties({"width" : 600, "height" : 120}));
});

function openSearchDialog(){
  var options = {};
  var beforeOpen = function(){};
  openDialog("search", options, beforeOpen);
}

function searchPhotos(){
  var date_start = jQuery("#date_start").val();
  var time_start = jQuery("#time_start").val();
  var date_end = jQuery("#date_end").val();
  var time_end = jQuery("#time_end").val();
  var params = {"user_id" : "0", "date_start" : date_start, "time_start" : time_start, "date_end" : date_end, "time_end" : time_end};
  jQuery.post("/blueprint", params, function(data){
    if (data.error) return;
    var info = data.info;
    jQuery("#search_info").text(info);
    var result = data.photos;
    buildResultGrid(result);
  });
}

function buildResultGrid(photos){
  var target = jQuery("#result");
  target.empty();

  if (photos && photos.length){
    for (var index = 0; index < photos.length; index++){
      var photo = photos[index];
      var id = photo.id;
      var preview_path = photo.preview_path ? "/blueprint/link_thumbs/" + photo.preview_path : "";
      var display_path = photo.display_path ? photo.display_path : "";
      var rotation = photo.orientation;

      var div = document.createElement("DIV");
      div.classList.add("thumb");
      div.onclick = getDisplayPhotoCallback(id, display_path, rotation);
      var div2 = document.createElement("DIV");
      var img = document.createElement("IMG");
      img.classList.add("rotated" + rotation);
      img.src = preview_path;
      div2.append(img);
      div.append(div2);
      target.append(div);
    }
  }
}

function getDisplayPhotoCallback(id, display_path, rotation){
  return function(){
    displayPhoto(id, display_path, rotation);
  }
}

var timeout = 0;

function showDialogControls(){
  var controls = jQuery("#controls");
  var display = controls.css("display");
  if (display === "none"){
    var options = {"direction" : "up"};
    controls.show("slide", options);
  }
  else{
    clearTimeout(timeout);
  }
  timeout = setTimeout(hideDialogControls, 3000);
}

function hideDialogControls(){
  var options = {"direction" : "up"};
  jQuery("#controls").hide("slide", options);
}

function displayPhoto(id, path, rotation){
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  var controls = jQuery("#controls");
  if (!overlay || !dialog || !controls) return;
  var document_height = jQuery(document).height();
  var viewport_height = jQuery(window).height();
  var scroll_top = jQuery(window).scrollTop();
  var dialog_top = Math.max(((viewport_height - 800) / 2), 0) + scroll_top;
  overlay.css("width", "100%");
  overlay.css("height", document_height + "px");
  dialog.css("top", dialog_top + "px");
  dialog.html("<img src='/ajax_loader_gray_48.gif' />");
  overlay.css("display", "block");
  controls.css("top", scroll_top);
  lockScrolling();
  var url = "/blueprint/photos";
  var params = {"path" : path, "rotation" : rotation};
  jQuery.get(url, params).done(function(data){
    jQuery("#photo_id").val("" + id);
    dialog.html(data);
    dialog.css("display", "block");
    dialog.removeClass("dialog-exif");
    dialog.addClass("dialog-photo");
  });
} 

function displayEXIF(path){
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  if (!overlay || !dialog) return;
  var document_height = jQuery(document).height();
  var viewport_height = jQuery(window).height();
  var scroll_top = jQuery(window).scrollTop();
  var dialog_top = Math.max(((viewport_height - 800) / 2), 0) + scroll_top;
  overlay.css("width", "100%");
  overlay.css("height", document_height + "px");
  dialog.css("top", dialog_top + "px");
  dialog.html("<img src='/ajax_loader_gray_48.gif' />");
  overlay.css("display", "block");
  var url = "/blueprint/exif";
  var params = {"path" : path};
  jQuery.get(url, params).done(function(data){
    dialog.html(data);
    dialog.css("display", "block");
    dialog.removeClass("dialog-photo");
    dialog.addClass("dialog-exif");
  });
}

function closePhoto(){
  unlockScrolling();
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  if (!overlay || !dialog) return;
  overlay.css("display", "none");
  dialog.html("");
  jQuery("#photo_id").val("");
}

function downloadPhoto(){
  var photoId = jQuery("#photo_id").val();
  window.open("/blueprint/download/" + photoId, "_self");
}
