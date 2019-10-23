var defaultDialogProperties = {
  autoOpen : false,
  position : {at : "center top+30%"},
  modal : true,
  resizable : false,
  show : {effect : "fade", duration : 500},
  hide : {effect: "fade", duration: 500}
};

function buildDialogProperties(options){
  var properties = {};
  for (var key in defaultDialogProperties){
    properties[key] = defaultDialogProperties[key];
  }
  if (options){
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        properties[key] = options[key];
      }
    }
  }
  return properties;
}

function openDialog(key, options, beforeOpen){
  var dialog = dialogs[key];
  if (dialog){
    if (options){
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          dialog.dialog("option", key, options[key]);
        }
      }
    }
    jQuery("#" + key + " input:text, #" + key + " textarea").each(function(){
      jQuery(this).val(""); // clear text inputs
      // do NOT do this on closeDialog since most actions close first and then process the inputs
    });
    if (beforeOpen) beforeOpen.call();
    dialog.dialog("open");
  }
}

function closeDialog(key){
  var dialog = dialogs[key];
  if (!dialog) return;
  dialog.dialog("close");
}

