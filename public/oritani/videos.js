function showDialogControls(){
  var options = {"direction" : "down"};
  jQuery("#controls").show("slide", options);
}

function hideDialogControls(){
  var options = {"direction" : "down"};
  jQuery("#controls").hide("slide", options);
}

function openVideo(id, path, width, height){
  if (width == 720) width = 640;
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  var content = jQuery("#content");
  if (!overlay || !dialog) return;

  var documentHeight = jQuery(document).height();
  var viewportHeight = jQuery(window).height();
  var scrollTop = jQuery(document).scrollTop();
  var dialogTop = Math.max(((viewportHeight - height) / 2), 0) + scrollTop;
  overlay.css("width", "100%");
  overlay.css("height", documentHeight + "px");
  dialog.css("top", dialogTop + "px");
  if (width) dialog.css("width", width + "px");
  if (height) dialog.css("height", (height + 40) + "px");
  content.html("<img src='/ajax_loader_gray_48.gif' />");
  overlay.css("display", "block");

  var title = jQuery("#title_" + id).val();
  jQuery("#info_title").text(title ? title : "");
  var date = jQuery("#date_" + id).val();
  jQuery("#info_date").text(date ? date : "");

  lockScrolling();
  var url = "/oritani/data?filename=" + path;
  var html = "<video controls=\"controls\">";
  html += "<source src=\"" + url + "\" type=\"video/mp4\" />";
  html += "<p>browser does NOT support tag</p></video>";
  content.html(html);
  dialog.css("display", "block");
  content.addClass("dialog-image");
}

function closeVideo(){
  unlockScrolling();
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  var content = jQuery("#content");
  if (!overlay || !dialog) return;
  overlay.css("display", "none");
  dialog.css("display", "none");
  content.html("");
}

function toggleInfo(){
  var info = jQuery("#info");
  var display = info.css("display");
  display = (display === "none") ? "block" : "none";
  info.css("display", display);
}
