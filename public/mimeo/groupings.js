var dialogs = {};
jQuery(function(){
  dialogs["create"] = jQuery("#create").dialog(buildDialogProperties({"width" : 500, "height" : 200}));
  dialogs["edit"] = jQuery("#edit").dialog(buildDialogProperties({"width" : 500, "height" : 210}));
});

function openCreateDialog(){
  var options = {};
  var beforeOpen = function(){};
  openDialog("create", options, beforeOpen);
}

function openEditDialog(groupingId){
  jQuery("#edit_grouping_id").val(groupingId);
  var options = {};
  var beforeOpen = function(){
    jQuery("#modify_title").val(jQuery("#title_" + groupingId).html());
    jQuery("#modify_description").val(jQuery("#description_" + groupingId).html());
  };
  openDialog("edit", options, beforeOpen);
}

function createGroup(){
  var title = jQuery("#create_title").val();
  var description = jQuery("#create_description").val();
  var url = "/mimeo/grouping/create";
  jQuery.post(url, {"title" : title, "description" : description}).done(function(result){
    if (result.error){
      alert("There was an error while creating the group.");
      return;
    }
    location.reload();
  });
}

function modifyGroup(){
  var groupingId = jQuery("#edit_grouping_id").val();
  var title = jQuery("#modify_title").val();
  var description = jQuery("#modify_description").val();
  var url = "/mimeo/grouping/modify";
  jQuery.post(url, {"grouping_id" : groupingId, "title" : title, "description" : description}).done(function(result){
    if (result.error){
      alert("There was an error while modifying the group.");
      return;
    }
    location.reload();
  });
}

function deleteGroup(){
  var response = confirm("The selected group will be deleted. Continue?");
  if (!response) return;
  var groupingId = jQuery("#edit_grouping_id").val();
  var url = "/mimeo/grouping/delete";
  jQuery.post(url, {"grouping_id" : groupingId}).done(function(result){
    if (result.error){
      alert("There was an error while deleting the group.");
      return;
    }
    jQuery("#grouping_" + groupingId).remove();
  });
}
