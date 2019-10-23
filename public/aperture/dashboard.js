jQuery(document).ready(function(){
  loadProjects();
  loadRankings();
  loadStats();

  loadProjectGroupData().then(function(){
    loadGroups();
  });

  loadAlarms().then(function(){
    return loadMemos();
  }).then(function(){
    return squareBulletin();
  }).then(function(){
    jQuery(".alarm div, .memo div").each(function(){
      var degrees = 2 - getRandomNumber(0, 4);
      jQuery(this).css("transform", "rotate(" + degrees + "deg)");
    });
    var containers = jQuery("#bulletin .container").toArray();
    if (!containers || (containers.length < 2)){
      jQuery("#bulletin .container").show();
    }
    else{
      showBulletin();
      setInterval(showBulletin, 5000);
    }
  });

  jQuery(function(){
    jQuery("#browser .accordion").accordion({"heightStyle" : "fill", "icons" : false});
    jQuery("#rankings .accordion").accordion({"heightStyle" : "fill", "icons" : false});
  });

  jQuery(window).resize(function(){
    adjustLayout();
  });

  adjustLayout();
});

function adjustLayout(){
  var windowWidth = jQuery(window).width();
  var windowHeight = jQuery(window).height();
  var TITLE_HEIGHT = jQuery("#title").outerHeight();
  var REPORT_HEIGHT = jQuery("#report").outerHeight();
  var CONTAINER_WIDTH = jQuery("#container").width();
  var PROJECTS_WIDTH = jQuery("#projects").width() + 20;

  jQuery("#projects").css("height", (windowHeight - TITLE_HEIGHT) + "px");
  jQuery("#stats").css("height", (windowHeight - (TITLE_HEIGHT + REPORT_HEIGHT)) + "px");
  jQuery("#stats").css("width", (CONTAINER_WIDTH - PROJECTS_WIDTH) + "px");
  jQuery("#report").css("width", (CONTAINER_WIDTH - PROJECTS_WIDTH) + "px");
}

function loadLastSession(){
  const url = "/session/load/last";
  jQuery.post(url, {}).done(function(result){
    if (!result || !result.urls || !result.urls.length) return;
    for (let i = 0; i < result.urls.length; i++){
      const pathname = result.urls[i];
      if (!pathname) continue;
      window.open(pathname, "_blank");
    }
  });
}

function loadProjects(){
  var url = "/aperture/data/projects";
  jQuery.get(url).done(function(result){
    if (!result) return;
    window.projects = result;
    search();

    jQuery("#browser .accordion").accordion("option", "active", 1); // should execute if no priorities
  });
}

var timeout = 0;
var searchTask = function(){
  if (!window.projects) return;
  var table = document.createElement("TABLE");
  var term = jQuery("#search_term").val();
  if (!term) term = "";
  term = term.toLowerCase();
  var index = 0;
  for (var i = 0; i < window.projects.length; i++){
    var project = window.projects[i];
    var searchString = project.name + project.tag;
    if (!searchString) searchString = "";
    searchString = searchString.toLowerCase();
    if (searchString.indexOf(term) >= 0){
      var row = table.insertRow(index);
      var cell0 = row.insertCell(0);
      var cell1 = row.insertCell(1);
      cell0.innerHTML = "<span><a href=\"/aperture/project/" + project.id + "\">" + project.name + "</a></span>";
      cell1.innerHTML = "<span>" + project.tag + "</span>";
      index += 1;
    }
  }
  jQuery("#result").html(table);
}

function search(){
  if (timeout) window.clearTimeout(timeout);
  timeout = window.setTimeout(searchTask, 1000);
}

function loadGroups(){
  jQuery("#result").nextAll().remove();
  var accordion = jQuery("#browser .accordion").first();

  if (!window.projectGroups || !window.projectGroups.length) return;
  var selected = [];
  for (var i = 0; i < window.projectGroups.length; i++){
    var header = window.projectGroups[i];
    if (header.order_index !== null) selected[header.order_index] = header;
  }
  for (var i = 0; i < selected.length; i++){
    var header = selected[i];
    if (!header) continue;
    var html = "<h3><span id=\"group_label_" + header.id + "\" class=\"label\"></span>";
    html += "<div class=\"group_link\"><span><a href=\"#\" onclick=\"openUpdateGroupDialog('" + header.id + "');return false;\">[update]</a><span></div></h3>";
    html += "<div id=\"group_table_" + header.id + "\" class=\"content\"></div>";
    accordion.append(html);
    updateProjectGroupPanel(header);
  }
  jQuery("#browser .accordion").accordion("refresh");
}

function updateProjectGroupPanel(projectGroup){
  if (!projectGroup) return;
  jQuery("#group_label_" + projectGroup.id).html(projectGroup.name);
  var table = document.createElement("TABLE");
  var groups = projectGroup.project_groups;
  var index = 0;
  for (var j = 0; j < groups.length; j++){
    var group = groups[j];
    var project = group.project;
    if (!project) continue;
    var row = table.insertRow(index);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    cell0.innerHTML = "<span><a href=\"/aperture/project/" + project.id + "\">" + project.name + "</a></span>";
    cell1.innerHTML = "<span>" + project.tag + "</span>";
    index += 1;
  }
  jQuery("#group_table_" + projectGroup.id).html(table);
}

function loadRankings(){
  var rankings = [];
  rankings.push({"target" : "recent_access", "url" : "/aperture/stats/ranking/recent/access", "limit" : 5});
  rankings.push({"target" : "recent_update", "url" : "/aperture/stats/ranking/recent/update", "limit" : 5});
  rankings.push({"target" : "count_access", "url" : "/aperture/stats/ranking/count/access", "limit" : 5});
  rankings.push({"target" : "count_update", "url" : "/aperture/stats/ranking/count/update", "limit" : 5});
  rankings.push({"target" : "count_file", "url" : "/aperture/stats/ranking/count/file", "limit" : 5});
  for (var i = 0; i < rankings.length; i++){
    var ranking = rankings[i];
    loadRanking(ranking.target, ranking.url, ranking.limit);
  }
}

function loadRanking(target, url, limit){
  var target = jQuery("#" + target);
  var params = {"limit" : limit};
  jQuery.post(url, params, function(data){
    if (data.error) return;
    var result = data.result;
    var table = document.createElement("TABLE");
    for (var i = 0; i < result.length; i++){
      var row = table.insertRow(i);
      var cell0 = row.insertCell(0);
      var cell1 = row.insertCell(1);
      cell0.innerHTML = "<span><a href=\"/aperture/project/" + result[i].id + "\">" + result[i].name + "</a></span>";
      cell1.innerHTML = "<span>" + result[i].value + "</span>";
    }
    target.append(table);
  });
}

function loadAlarms(){
  var promise = new Promise(function(resolve, reject){
    var url = "/aperture/data/alarms";
    jQuery.get(url).done(function(result){
      if (result.error) return;
      for (var i = 0; i < result.length; i++){
        var projectId = result[i].projectId;
        var label = jQuery.trim(result[i].label);
        var comment = jQuery.trim(result[i].comment);
        if (!label) continue;
        addToBulletin(true, projectId, label, comment);
      }
      resolve(true);
    });
  });
  return promise;
}

function loadMemos(){
  var promise = new Promise(function(resolve, reject){
    var url = "/aperture/data/memos";
    jQuery.get(url).done(function(result){
      if (result.error) return;
      for (var i = 0; i < result.length; i++){
        var projectId = result[i].projectId;
        var memo = jQuery.trim(result[i].memo);
        if (!memo) continue;
        addToBulletin(false, projectId, memo, "");
      }
      resolve(true);
    });
  });
  return promise;
}

function addToBulletin(isAlarm, projectId, content, tooltip){
  var html = "<div class=\"" + (isAlarm ? "alarm" : "memo") + "\" title=\"" + tooltip + "\" onclick=\"openProject('" + projectId + "');\"><div><pre>" + content + "</pre></div></div>";
  var last = jQuery("#bulletin .container").last();
  if ((last.length === 0) || (jQuery(last).children().length === 3)){
    jQuery("#bulletin").append("<div class=\"container\">" + html + "</div>");
  }
  else{
    jQuery(last).append(html);
  }
}

function squareBulletin(){
  var promise = new Promise(function(resolve, reject){
    var last = jQuery("#bulletin .container").last();
    var items = jQuery(last).children().toArray();
    for (var i = items.length; i < 3; i++){
      var html = "<div class=\"memo\"><div>&nbsp;</div></div>";
      jQuery(last).append(html);
    }
    resolve(true);
  });
  return promise
}

function showBulletin(){
  var effect = "fade";
  var effect_timing = 500;

  var current = window["current_container_index"];
  var next = window["next_container_index"];
  var containers = window["bulletin_containers"];
  if (!containers || (containers.length == 0)){
    containers = jQuery("#bulletin .container").toArray();
    current = containers.length - 1;
    next = 0;
    window["bulletin_containers"] = containers;
    window["current_container_index"] = current;
    window["next_container_index"] = next;
  }
  
  jQuery(containers[current]).hide(effect, {}, effect_timing, function(){
    jQuery(containers[next]).show(effect, {}, effect_timing, function(){
      window["current_container_index"] = (current + 1) % containers.length;
      window["next_container_index"] = (next + 1) % containers.length;
    });
  });
}

function getRandomNumber(min, max){
  return Math.floor((Math.random() * max) + min); 
}

function loadStats(){
  var url = "/aperture/stats/charts";
  var start = jQuery("#config_stats_start").val();
  var month = jQuery("#config_stats_month").val();
  var year = jQuery("#config_stats_year").val();
  var params = {"start" : start, "month" : month, "year" : year};
  jQuery.post(url, params, function(data){
    if (data.error) return;
    if (data.line) buildChart("line", "line", data.line, {"maintainAspectRatio" : false, "legend" : {"display" : false}});
    else jQuery("#line").html("<span class=\"error\">No Data Available</span>");
    if (data.pie) buildChart("pie", "pie", data.pie);
    else jQuery("#pie").html("<span class=\"error\">No Data Available</span>");
  });
}

function buildChart(target, type, data, options){
  var element = document.getElementById(target + "_canvas");
  var context = element.getContext("2d");
  var chartId = target + "_chart";
  if (window[chartId]) window[chartId].destroy(); // clear previous chart data
  window[chartId] = new Chart(context, {"type" : type, "data" : data, "options" : options});
};

function openProject(projectId){
  var pathname = "/aperture/project/" + projectId;
  var w = window.open(pathname, "_self");
}

var dialogs = {};
jQuery(function(){
  dialogs["manage_groups"] = jQuery("#manage_groups").dialog(buildDialogProperties({"width" : 500, "height" : 400}));
  dialogs["update_group"] = jQuery("#update_group").dialog(buildDialogProperties({"width" : 500, "height" : 400}));
  dialogs["config_stats"] = jQuery("#config_stats").dialog(buildDialogProperties({"width" : 500, "height" : 200}));

  jQuery("#unselected_groups").sortable({
    connectWith : "#selected_groups"
  }).disableSelection();

  jQuery("#selected_groups").sortable({
    connectWith : "#unselected_groups",
    update : update_selected_groups
  }).disableSelection();

  update_selected_groups();

  jQuery("#unselected_projects").sortable({
    connectWith : "#selected_projects"
  }).disableSelection();

  jQuery("#selected_projects").sortable({
    connectWith : "#unselected_projects",
    update : update_selected_projects
  }).disableSelection();

  update_selected_projects();
});

function update_selected_groups(event, ui){
  var array = jQuery("#selected_groups").sortable("toArray");
  if (array.length >= 5) jQuery("#unselected_groups").sortable("option", "connectWith", "");
  else jQuery("#unselected_groups").sortable("option", "connectWith", "#selected_groups");
}

function update_selected_projects(event, ui){
  var array = jQuery("#selected_projects").sortable("toArray");
  jQuery("#unselected_projects").sortable("option", "connectWith", "#selected_projects");
}

function openManageGroupsDialog(){
  var options = {};
  var beforeOpen = function(){
    refreshManageGroupsDialog();
  };
  openDialog("manage_groups", options, beforeOpen);
}

function createGroup(){
  var url = "/aperture/group/create";
  var name = jQuery("#create_group_name").val();
  var params = {"group_name" : name};
  jQuery.post(url, params, function(data){
    if (data.error){
      alert("Unable to create project group.");
      return;
    }
    loadProjectGroupData().then(function(){
      refreshManageGroupsDialog();
    });
  });
}

function deleteGroup(){
  var confirmed = confirm("This will delete the selected group from the system. Continue?");
  if (!confirmed) return;
  var url = "/aperture/group/delete";
  var id = jQuery("#delete_group_id").val();
  var params = {"group_id" : id};
  jQuery.post(url, params, function(data){
    if (data.error){
      alert("Unable to delete project group.");
      return;
    }
    loadProjectGroupData().then(function(){
      refreshManageGroupsDialog();
      loadGroups();
    });
  });
}

function applyGroupSelections(){
  var order = [];
  jQuery("#selected_groups li").each(function(){
    var value = jQuery(this).find("input").val();
    order.push(value);
  });
  var url = "/aperture/group/select";
  var params = {"order" : JSON.stringify(order)};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT apply selection.");
      return;
    }
    loadProjectGroupData().then(function(){
      refreshManageGroupsDialog();
      loadGroups();
    });
  });
}

function refreshManageGroupsDialog(){
  jQuery("#delete_group_id").empty();
  jQuery("#unselected_groups").empty();
  jQuery("#selected_groups").empty();

  if (!window.projectGroups || !window.projectGroups.length) return;
  var available = [];
  var selected = [];
  for (var i = 0; i < window.projectGroups.length; i++){
    var header = window.projectGroups[i];
    if (header.order_index !== null) selected[header.order_index] = header;
    else available.push(header);

    var option = "<option value=\"" + header.id + "\">" + header.name + "</option>";
    jQuery("#delete_group_id").append(option);
  }
  for (var i = 0; i < available.length; i++){
    var header = available[i];
    var html = createGroupSelectionLI(header.id, header.name);
    jQuery("#unselected_groups").append(html);
  }
  for (var i = 0; i < selected.length; i++){
    var header = selected[i];
    if (!header) continue;
    var html = createGroupSelectionLI(header.id, header.name);
    jQuery("#selected_groups").append(html);
  }
  update_selected_groups();
}

function loadProjectGroupData(){
  var promise = new Promise(function(resolve, reject){
    var url = "/aperture/data/groups";
    jQuery.get(url).done(function(data){
      if (data.error) return;
      window.projectGroups = data.result;
      resolve(true);
    });
  });
  return promise;
}

function createGroupSelectionLI(id, name){
  return "<li id=\"group_item_" + id + "\" class=\"ui-state-default\"><span class=\"ui-icon\"><input type=\"hidden\" value=\"" + id + "\" /></span><span class=\"label\">" + name + "</span></li>";
}

function openUpdateGroupDialog(groupId){
  jQuery("#project_group_id").val(groupId);
  var options = {};
  var beforeOpen = function(){
    refreshUpdateGroupDialog(groupId);
  };  
  openDialog("update_group", options, beforeOpen);
}

function refreshUpdateGroupDialog(groupId){
  jQuery("#unselected_projects").empty();
  jQuery("#selected_projects").empty();

  var projects = window.projects;
  var groups = window.projectGroups;
  var group = 0;
  for (var i = 0; i < groups.length; i++){
    if (groups[i].id == groupId){
      group = groups[i];
      break;
    }
  }
  if (!group) return;

  jQuery("#update_group_name").val(group.name);
  var selectedProjectIds = {};
  var groupProjects = group.project_groups;
  for (var i = 0; i < groupProjects.length; i++){
    var project = groupProjects[i].project;
    if (!project) continue;
    selectedProjectIds["id_" + project.id] = true;
  }

  for (var i = 0; i < projects.length; i++){
    var project = projects[i];
    var id = project.id;
    var html = createProjectSelectionLI(id, project.name);
    if (selectedProjectIds["id_" + id]){
      jQuery("#selected_projects").append(html);
    }
    else{
      jQuery("#unselected_projects").append(html);
    }
  }

  update_selected_projects();
}

function updateGroup(){
  var projectIds = [];
  jQuery("#selected_projects li").each(function(){
    var value = jQuery(this).find("input").val();
    projectIds.push(value);
  });
  var name = jQuery("#update_group_name").val();
  var groupId = jQuery("#project_group_id").val();
  var url = "/aperture/group/update/" + groupId;
  var params = {"name" : name, "projects" : JSON.stringify(projectIds)};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT update group.");
      return;
    }
    loadProjectGroupData().then(function(){
      closeDialog("update_group");
      refreshManageGroupsDialog();
      updateProjectGroupPanel(result.group);
    });
  });
}

function createProjectSelectionLI(id, name){
  return "<li id=\"project_item_" + id + "\" class=\"ui-state-default\"><span class=\"ui-icon\"><input type=\"hidden\" value=\"" + id + "\" /></span><span class=\"label\">" + name + "</span></li>";
}

function openConfigStatsDialog(){
  var options = {};
  var beforeOpen = function(){
    jQuery("#config_stats_start").empty();
  };
  openDialog("config_stats", options, beforeOpen);
}
