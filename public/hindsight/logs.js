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
    cell0.innerHTML = "<span>Title</span>";
    cell1.innerHTML = "<span>Description</span>";
    cell2.innerHTML = "<span>Timestamp</span>";
  }
  for (var i = 0; i < result.length; i++){
    var row = table.insertRow(i + 1);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    cell0.innerHTML = "<span><a href=\"#\" onclick=\"displayLog('" + result[i].id + "', '" + result[i].path + "');return false;\">" + result[i].title + "</a></span>";
    cell1.innerHTML = "<span>" + result[i].description + "</span>";
    cell2.innerHTML = "<span>" + result[i].edit_end + "</span>";
  }
  target.append(table);
}

var dialogs = {};
jQuery(function(){
  dialogs["search"] = jQuery("#search").dialog(buildDialogProperties({"width" : 600, "height" : 160}));
  dialogs["display"] = jQuery("#display").dialog(buildDialogProperties({"width" : 800, "height" : 640, "position" : {"at" : "center"}}));
});

function openSearchDialog(){
  var options = {};
  var beforeOpen = function(){};
  openDialog("search", options, beforeOpen);
}

function searchLogs(){
  var date_start = jQuery("#date_start").val();
  var time_start = jQuery("#time_start").val();
  var date_end = jQuery("#date_end").val();
  var time_end = jQuery("#time_end").val();
  var search_term = jQuery("#search_term").val();
  var params = {"user_id" : "0", "date_start" : date_start, "time_start" : time_start, "date_end" : date_end, "time_end" : time_end, "search_term" : search_term};
  jQuery.post("/hindsight/logs", params, function(data){
    if (data.error) return;
    var info = data.info;
    jQuery("#search_info").text(info);
    var result = data.logs;
    buildResultTable(result);
  });
}

function displayLog(log_id, path){
  var content = jQuery("#content");    
  content.html("<img src='/ajax_loader_gray_48.gif' />");
  openDialog("display", {}, function(){});

  var url = "/hindsight/log";
  var params = {"log_id" : log_id, "path" : path};
  jQuery.get(url, params).done(function(data){
    content.html("");
    var header = data.header;
    content.html(header);
    var xml = data.xml;
    var xsl = data.xsl;
    var xml_doc = jQuery.parseXML(xml);
    var xsl_doc = jQuery.parseXML(xsl);
    var xslt = new XSLTProcessor();
    xslt.importStylesheet(xsl_doc);
    var result_doc = xslt.transformToFragment(xml_doc, document);
    content.append(result_doc);
  });
}

function closeLog(){
  closeDialog("display");
  var content = jQuery("#content");
  content.html("");
}

