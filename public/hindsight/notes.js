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

function buildResultTable(result){
  var target = jQuery("#result");
  target.empty();
  var table = document.createElement("TABLE");
  {
    var row = table.insertRow(0);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    cell0.innerHTML = "<span>Timestamp</span>";
    cell1.innerHTML = "<span>Content</span>";
  }
  for (var i = 0; i < result.length; i++){
    var row = table.insertRow(i + 1);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    cell0.innerHTML = "<span><a href=\"#\" onclick=\"openEditDialog('" + i + "');return false;\">" + result[i].datetime + "</a></span>";
    cell1.innerHTML = "<span id=\"note_content_" + i + "\">" + result[i].content + "</span>";
  }
  target.append(table);
}

var dialogs = {};
jQuery(function(){
  dialogs["search"] = jQuery("#search").dialog(buildDialogProperties({"width" : 600, "height" : 160}));
  dialogs["edit"] = jQuery("#edit").dialog(buildDialogProperties({"width" : 600, "height" : 120}));
});

function openSearchDialog(){
  var options = {};
  var beforeOpen = function(){};
  openDialog("search", options, beforeOpen);
}

function searchNotes(){
  var date_start = jQuery("#date_start").val();
  var time_start = jQuery("#time_start").val();
  var date_end = jQuery("#date_end").val();
  var time_end = jQuery("#time_end").val();
  var search_term = jQuery("#search_term").val();
  var params = {"user_id" : "0", "date_start" : date_start, "time_start" : time_start, "date_end" : date_end, "time_end" : time_end, "search_term" : search_term};
  jQuery.post("/hindsight/notes", params, function(data){
    if (data.error) return;
    var info = data.info;
    jQuery("#search_info").text(info);
    var result = data.notes;
    buildResultTable(result);
  });
}

function openEditDialog(index){
  var options = {};
  var beforeOpen = function(){
    jQuery("#edit_index").val(index);
    var content = jQuery("#note_content_" + index).text();
    jQuery("#edit_content").empty();
    if (content) jQuery("#edit_content").val(content);
  };
  openDialog("edit", options, beforeOpen);
}

function updateNote(){
  var index = jQuery("#edit_index").val();
  var content = jQuery("#edit_content").val();
  var params = {"user_id" : 0, "edit_action" : "update", "edit_index" : index, "edit_content" : content};
  jQuery.post("/hindsight/note/edit", params, function(data){
    if (data.error){
      alert("Failed to update note.");
      return;
    }
    var result = data.notes;
    buildResultTable(result);
  });
}

function deleteNote(){
  var response = confirm("The selected note will be deleted. Continue?");
  if (response){
    closeDialog("edit");
    var index = jQuery("#edit_index").val();
    var params = {"user_id" : 0, "edit_action" : "delete", "edit_index" : index};
    jQuery.post("/hindsight/note/edit", params, function(data){
      if (data.error){
        alert("Failed to delete note.");
        return;
      }
      var result = data.notes;
      buildResultTable(result);
    });
  }
}
