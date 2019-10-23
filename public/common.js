function showDialog(params){
  if (!params) return;
  var overlay_id = params["overlay_id"];
  var dialog_id = params["dialog_id"];
  var dialog_top = params["top"];
  var dialog_height = params["height"];

  var overlay = jQuery("#" + overlay_id);
  var dialog = jQuery("#" + dialog_id);
  if (!overlay || !dialog) return;

  if (!dialog_height) dialog_height = dialog.height();
  var document_height = jQuery(document).height();
  var viewport_height = jQuery(window).height();
  var scroll_top = jQuery(window).scrollTop();
  if (!dialog_top) dialog_top = Math.max(((viewport_height - dialog_height) / 2), 0) + scroll_top;

  overlay.css("width", "100%");
  overlay.css("height", document_height + "px");
  dialog.css("top", dialog_top + "px");
  overlay.css("display", "block");
  dialog.css("visibility", "visible");
  dialog.css("opacity", "1");

  lockScrolling();
}       
      
function hideDialog(params){
  if (!params) return;
  var overlay_id = params["overlay_id"];
  var dialog_id = params["dialog_id"];

  var overlay = jQuery("#" + overlay_id);
  var dialog = jQuery("#" + dialog_id);
  if (!overlay || !dialog) return;

  overlay.css("display", "none");
  dialog.css("visibility", "hidden");
  dialog.css("opacity", "0");

  unlockScrolling();
}

function lockScrolling(){
  var body = jQuery("body");
  body.css("overflow", "hidden");
  var viewportHeight = jQuery(window).height();
  body.css("height", viewportHeight);
}

function unlockScrolling(){
  var body = jQuery("body");
  body.css("overflow", "auto");
  var documentHeight = jQuery(document).height();
  body.css("height", documentHeight);
}
   
