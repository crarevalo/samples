jQuery(document).ready(function(){
  loadChecklistsTable();

  jQuery(function(){
    var options = {
      defaultDate : "+1w",
      changeMonth : true,
      changeYear : true,
      numberOfMonths : 1,
      dateFormat : "y_mmdd"
    };
    var dateFormat = "y_mmdd";
    var from = jQuery("#start").datepicker(options).on("change", function(){
      to.datepicker("option", "minDate", getDate(this));
    });
    var to = jQuery("#end").datepicker(options).on("change", function(){
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

function showLoadingIndicator(target_id){
  if (!target_id) return;
  jQuery("#" + target_id).html("<div class=\"loading\"><img src=\"/ajax_loader_gray_48.gif\" /></div>"); 
}

function loadChecklistsTable(){
  showLoadingIndicator("content");
  var url = "/crosscheck/content/checklists";
  var params = {};
  jQuery.post(url, params).done(function(html){
    jQuery("#content").html(html);
  }); 
}

function showCreateDialog(){
  var params = {
    "overlay_id" : "dialog_overlay",
    "dialog_id" : "create_dialog",
    "top" : "100"
  };
  showDialog(params);
}

function hideCreateDialog(){
  var params = {
    "overlay_id" : "dialog_overlay",
    "dialog_id" : "create_dialog"
  };
  hideDialog(params);
}      

function submitCreateDialog(){
  var form = document.forms["create_checklist"];
  var name = form.elements["name"].value;
  var description = form.elements["description"].value;
  var start = form.elements["start"].value;
  var end = form.elements["end"].value;
  var ages = form.elements["ages"].checked ? "1" : "0";
  var resets = form.elements["resets"].checked ? "1" : "0";
  var url = "/crosscheck/create";
  var params = {"name" : name, "description" : description, "start" : start, "end" : end, "ages" : ages, "resets" : resets};
  jQuery.post(url, params).done(function(data){
    if (data.message) alert(data.message);
    if (data.error) alert(data.error);
    loadChecklistsTable();
    hideCreateDialog();
  });
}

function openChecklist(checklist_id){
  window.location = "/crosscheck/" + checklist_id;
}
