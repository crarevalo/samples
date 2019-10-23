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
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    cell0.innerHTML = "<span>Timestamp</span>";
    cell1.innerHTML = "<span>Contact</span>";
    cell2.innerHTML = "<span>Direction</span>";
    cell3.innerHTML = "<span>Message</span>";
  }
  for (var i = 0; i < result.length; i++){
    var row = table.insertRow(i + 1);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    cell0.innerHTML = "<span>" + result[i].moment + "</span>";
    cell1.innerHTML = "<span>" + result[i].name + "</span>";
    cell2.innerHTML = "<span>" + result[i].direction + "</span>";
    cell3.innerHTML = "<span>" + result[i].message + "</span>";
  }
  target.append(table);
}

var dialogs = {};
jQuery(function(){
  dialogs["search"] = jQuery("#search").dialog(buildDialogProperties({"width" : 600, "height" : 160}));
});

function openSearchDialog(){
  var options = {};
  var beforeOpen = function(){};
  openDialog("search", options, beforeOpen);
}

function searchTexts(){
  var date_start = jQuery("#date_start").val();
  var time_start = jQuery("#time_start").val();
  var date_end = jQuery("#date_end").val();
  var time_end = jQuery("#time_end").val();
  var number = jQuery("#number").val();
  var params = {"user_id" : "0", "date_start" : date_start, "time_start" : time_start, "date_end" : date_end, "time_end" : time_end, "number" : number};
  jQuery.post("/hindsight/texts", params, function(data){
    if (data.error) return;
    var info = data.info;
    jQuery("#search_info").text(info);
    var result = data.texts;
    buildResultTable(result);
  });
}
