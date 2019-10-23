jQuery(document).ready(function(){
  var url = "/deltaic/data";
  jQuery.get(url, {}, function(result){
    var unions = result.unions;
    window.unions = unions;
    jQuery("#overlay").css("display", "none");
    jQuery("#seach_term").val("");
    jQuery("#main").css("display", "");
  });
});

var timeout = 0;
var searchTask = function(){
  if (!window.unions) return;
  var table = document.createElement("TABLE");
  var term = jQuery("#search_term").val();
  if (!term){
    jQuery("#result").html("");
    return;
  }
  term = term.toLowerCase();
  var index = 0;
  for (var unionId in window.unions){
    var label = window.unions[unionId];
    var searchString = label;
    if (!searchString) searchString = "";
    searchString = searchString.toLowerCase();
    if (searchString.indexOf(term) >= 0){
      var row = table.insertRow(index);
      var cell0 = row.insertCell(0);
      cell0.innerHTML = "<span><a href=\"/deltaic/" + unionId + "\">" + label + "</a></span>";
      index += 1;
    }
  }
  jQuery("#result").html(table);
}

function search(){
  if (timeout) window.clearTimeout(timeout);
  timeout = window.setTimeout(searchTask, 1000);
}

