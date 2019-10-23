jQuery(document).ready(function(){
  loadTasksTable();

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

function loadTasksTable(){
  //showLoadingIndicator("content");
  var checklist_id = jQuery("#checklist_id").val();
  var url = "/crosscheck/content/tasks";
  var params = {"checklist_id" : checklist_id};
  jQuery.post(url, params).done(function(html){
    jQuery("#content").html(html);
  }); 
}

function showTaskOptions(task_id){
  if (!task_id) return;
  jQuery("#task_options_" + task_id).css("visibility", "visible");
}

function hideTaskOptions(task_id){
  if (!task_id) return;
  jQuery("#task_options_" + task_id).css("visibility", "hidden");
}

function closeChecklist(){
  window.location = "/crosscheck";
}

function showEditDialog(){
  var params = {
    "overlay_id" : "loader_overlay",
    "dialog_id" : "loader"
  };
  showDialog(params);

  var checklist_id = jQuery("#checklist_id").val();
  var url = "/crosscheck/checklist/" + checklist_id;
  var params = {};
  var form = document.forms["edit_checklist"];
  jQuery.post(url, params).done(function(data){
    if (data.error) alert(data.error);
    if (data.checklist){
      jQuery(form).find("input[name='name']").val(data.checklist.name);
      jQuery(form).find("textarea[name='description']").val(data.checklist.description);
      jQuery(form).find("input[name='start']").val(data.start_str);
      jQuery(form).find("input[name='end']").val(data.end_str);
      jQuery(form).find("input[name='ages']").prop("checked", data.checklist.ages);
      jQuery(form).find("input[name='resets']").prop("checked", data.checklist.resets);
    }
    var params = {
      "overlay_id" : "loader_overlay",
      "dialog_id" : "loader"
    }; 
    hideDialog(params);
    params = {
      "overlay_id" : "dialog_overlay",
      "dialog_id" : "edit_dialog",
      "top" : "100"
    };
    showDialog(params);
  });
}

function hideEditDialog(){
  var params = {
    "overlay_id" : "dialog_overlay",
    "dialog_id" : "edit_dialog"
  };
  hideDialog(params);
}

function submitEditDialog(){
  var checklist_id = document.forms["page_data"].elements["checklist_id"].value;
  var form = document.forms["edit_checklist"];
  var name = form.elements["name"].value;
  var description = form.elements["description"].value;
  var start = form.elements["start"].value;
  var end = form.elements["end"].value;
  var ages = form.elements["ages"].checked ? "1" : "0";
  var resets = form.elements["resets"].checked ? "1" : "0";
  var url = "/crosscheck/edit";
  var params = {"checklist_id" : checklist_id, "name" : name, "description" : description, "start" : start, "end" : end, "ages" : ages, "resets" : resets};
  jQuery.post(url, params).done(function(data){
    if (data.message){
      alert(data.message);
      jQuery("#checklist_name").text(name);
    }
    if (data.error) alert(data.error);
    loadTasksTable();
    hideEditDialog();
  });
}

function showPostDialog(){
  var params = {
    "overlay_id" : "dialog_overlay",
    "dialog_id" : "post_dialog",
    "top" : "100"
  };
  showDialog(params);
}

function hidePostDialog(){
  var params = {
    "overlay_id" : "dialog_overlay",
    "dialog_id" : "post_dialog"
  };
  hideDialog(params);
}

function submitPostDialog(){
  var checklist_id = document.forms["page_data"].elements["checklist_id"].value;
  var form = document.forms["post_task"];
  var description = form.elements["description"].value;
  var comment = form.elements["comment"].value;
  var url = "/crosscheck/post";
  var params = {"checklist_id" : checklist_id, "description" : description, "comment" : comment};
  jQuery.post(url, params).done(function(data){
    if (data.message) alert(data.message);
    if (data.error) alert(data.error);
    loadTasksTable();
    hidePostDialog();
  });
}

function showUpdateDialog(task_id){
  var params = {
    "overlay_id" : "loader_overlay",
    "dialog_id" : "loader"
  };  
  showDialog(params);
  
  var url = "/crosscheck/task/" + task_id;
  var params = {};
  var form = document.forms["update_task"];
  jQuery.post(url, params).done(function(data){
    if (data.error) alert(data.error);
    if (data.task){
      jQuery(form).find("input[name='description']").val(data.task.description);
      jQuery(form).find("textarea[name='comment']").val(data.task.comment);
      jQuery("#update_dialog_submit").click(function(){submitUpdateDialog(task_id);return false;});
      loadTaskMembership(task_id);
    }
    var params = {
      "overlay_id" : "loader_overlay",
      "dialog_id" : "loader"
    }; 
    hideDialog(params);
    params = {
      "overlay_id" : "dialog_overlay",
      "dialog_id" : "update_dialog",
      "top" : "100"
    };
    showDialog(params);
  });
}

function hideUpdateDialog(){
  var params = {
    "overlay_id" : "dialog_overlay",
    "dialog_id" : "update_dialog"
  };
  hideDialog(params);
}

function submitUpdateDialog(task_id){
  var form = document.forms["update_task"];
  var description = form.elements["description"].value;
  var comment = form.elements["comment"].value;
  var url = "/crosscheck/update";
  var params = {"task_id" : task_id, "description" : description, "comment" : comment};
  jQuery.post(url, params).done(function(data){
    if (data.message){
      alert(data.message);
    }
    if (data.error) alert(data.error);
    loadTasksTable();
    //hideUpdateDialog();
  });
}

function checkTask(task_id){
  if (!window.checked_tasks) window.checked_tasks = {};
  window.checked_tasks[task_id] = true;
  jQuery("#checkbox_" + task_id).prop("disabled", true);
  jQuery("#task_links_" + task_id).css("display", "none");
  jQuery("#undo_" + task_id).css("display", "block");
}

function cancelTask(task_id){
  if (!window.cancelled_tasks) window.cancelled_tasks = {};
  window.cancelled_tasks[task_id] = false;
  jQuery("#checkbox_" + task_id).prop("disabled", true);
  jQuery("#task_links_" + task_id).css("display", "none");
  jQuery("#undo_" + task_id).css("display", "block");
  jQuery("#description_" + task_id).css("text-decoration", "line-through");
}

function undoChanges(task_id){
  if (!window.checked_tasks) window.checked_tasks = {};
  if (window.checked_tasks[task_id]) delete window.checked_tasks[task_id];
  if (!window.cancelled_tasks) window.cancelled_tasks ={};
  if (window.cancelled_tasks[task_id]) delete window.cancelled_tasks[task_id];
  jQuery("#checkbox_" + task_id).prop("disabled", false).prop("checked", false);
  jQuery("#task_links_" + task_id).css("display", "");
  jQuery("#undo_" + task_id).css("display", "none");
  jQuery("#description_" + task_id).css("text-decoration", "none");
}

function applyChanges(){
  var url = "/crosscheck/apply";

  var checked_array = [];
  if (window.checked_tasks){
    for (var task_id in window.checked_tasks){
      if (window.checked_tasks.hasOwnProperty(task_id)){
        checked_array.push(task_id);
      }
    }
  }

  var cancelled_array = [];
  if (window.cancelled_tasks){
    for (var task_id in window.cancelled_tasks){
      if (window.cancelled_tasks.hasOwnProperty(task_id)){
        cancelled_array.push(task_id);
      }
    }
  }

  var params = {"checked" : JSON.stringify(checked_array), "cancelled" : JSON.stringify(cancelled_array)};
  jQuery.post(url, params).done(function(data){
    if (data.message) alert(data.message);
    if (data.error) alert(data.error);
    loadTasksTable();
    hidePostDialog();
  });   

}

function loadTaskMembership(task_id){
  var url = "/crosscheck/membership/" + task_id;
  var params = {"task_id" : task_id};
  var form = document.forms["update_task"];
  jQuery.post(url, params).done(function(html){
    jQuery("#task_membership").html(html);
  });  
}

function addMembership(task_id){
  var form = document.forms["update_task"];
  var checklist_id = jQuery(form).find("select[name='selected_membership_checklist_id']").val();
  var url = "/crosscheck/add";
  var params = {"checklist_id" : checklist_id, "task_id" : task_id};
  jQuery.post(url, params).done(function(data){
    if (data.message) alert(data.message);
    if (data.error) alert(data.error);
    loadTaskMembership(task_id);
    loadTasksTable();
  });
}

function removeMembership(checklist_id, task_id){
  var url = "/crosscheck/remove";
  var params = {"checklist_id" : checklist_id, "task_id" : task_id};
  jQuery.post(url, params).done(function(data){
    if (data.message) alert(data.message);
    if (data.error) alert(data.error);
    loadTaskMembership(task_id);
    loadTasksTable();
  });  
}

