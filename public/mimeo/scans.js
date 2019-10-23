var dialogs = {};
jQuery(function(){
  dialogs["add"] = jQuery("#add").dialog(buildDialogProperties({"width" : 500, "height" : 120}));
});

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

function openScan(id, path){
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  var controls = jQuery("#controls");
  if (!overlay || !dialog || !controls) return;
  var documentHeight = jQuery(document).height();
  var viewportHeight = jQuery(window).height();
  var scrollTop = jQuery(document).scrollTop();
  var dialogTop = Math.max(((viewportHeight - 800) / 2), 0) + scrollTop;
  overlay.css("width", "100%");
  overlay.css("height", documentHeight + "px");
  dialog.css("top", dialogTop + "px");
  //dialog.css("width", "800px");
  //dialog.css("height", "800px");
  dialog.html("<img src='/ajax_loader_gray_48.gif' />");
  overlay.css("display", "block");
  controls.css("top", scrollTop);
  lockScrolling();
  var rotation = jQuery("#rotation_" + id).val();
  var url = "/mimeo/scans";
  var params = {"path" : path, "rotation" : rotation};
  jQuery.get(url, params).done(function(data){
    jQuery("#scan_id").val("" + id);
    dialog.html(data);
    dialog.css("display", "block");
    dialog.addClass("dialog-scan");
  });
}

function closeScan(){
  unlockScrolling();
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  var content = jQuery("#content");
  if (!overlay || !dialog) return;
  overlay.css("display", "none");
  dialog.css("display", "none");
  content.html("");
  jQuery("#scan_id").val("");
}

function downloadScan(){
  var scanId = jQuery("#scan_id").val();
  window.open("/mimeo/download/" + scanId, "_self");
}

function rotateScan(){
  var scanId = jQuery("#scan_id").val();
  var url = "/mimeo/rotate/" + scanId;
  jQuery.get(url, {}).done(function(result){
    if (result.error){
      alert("There was an error while rotating the scan.");
      return;
    }
    closeScan();
    var rotation = result.orientation;
    var thumb = jQuery("#thumb_" + scanId);
    thumb.removeClass();
    thumb.addClass("rotated" + rotation);
    jQuery("#rotation_" + scanId).val(rotation);
  });
}

function openAddDialog(){
  var options = {};
  var beforeOpen = function(){};
  openDialog("add", options, beforeOpen);
} 

function addScan(){
  var groupingId = jQuery("#add_grouping_id").val();
  var scanId = jQuery("#scan_id").val();
  var url = "/mimeo/grouping/" + groupingId + "/add/" + scanId;
  jQuery.get(url, {}).done(function(result){
    if (result.error){
      alert("There was an error while adding the scan.");
      return;
    }
  });
}

function removeScan(){
  var response = confirm("Remove the scan from the current grouping?");
  if (!response) return;

  var groupingId = jQuery("#grouping_id").val();
  var scanId = jQuery("#scan_id").val();
  var url = "/mimeo/grouping/" + groupingId + "/remove/" + scanId;
  jQuery.get(url, {}).done(function(result){
    if (result.error){
      alert("There was an error while removing the scan.");
      return;
    }
    closeScan();
    jQuery("#thumb_" + scanId).parent().parent().remove();
  });
}

function setAsCover(){
  var groupingId = jQuery("#grouping_id").val();
  var scanId = jQuery("#scan_id").val();
  var url = "/mimeo/grouping/" + groupingId + "/cover/" + scanId;
  jQuery.get(url, {}).done(function(result){
    if (result.error){
      alert("There was an error while setting the group cover.");
      return;
    }
  });
}
