jQuery(document).ready(function(){
  var height = jQuery(window).height() - 150;
  jQuery("#page").css("min-height", height + "px");
  loadAllSections();
});

var loadAllSections = function(){
  var projectId = jQuery("#project_id").val();
  var url = "/aperture/project/" + projectId + "/sections";
  jQuery.get(url).done(function(data){
    var headers = data.headers;

    // remove existing sections (except description), options, and items
    jQuery(".section").each(function(){
      var id = this.id;
      if (id !== "description") jQuery(this).remove();
    });
    jQuery("#edit_section_id option").remove();
    jQuery("#section_order li").remove();

    // create empty section DIVs using headers
    var html = "";
    var options = "";
    var items = "";
    for (var i = 0; i < headers.length; i++){
      var header = headers[i];
      html += createSectionDIV(header.id);
      options += createSectionOPTION(header.id, header.name);
      items += createSectionOrderLI(header.id, header.name);
    }
    jQuery("#description").after(html);
    jQuery("#edit_section_id").append(options);
    jQuery("#section_order").append(items);

    for (var i = 0; i < headers.length; i++){
      var header = headers[i];
      loadSection(header.id, header.type_id);
    }
  });
};

var createSectionDIV = function(id){
  return "<div id=\"section_" + id + "\" class=\"section\"><div class=\"loading\"><img src=\"/ajax_loader_gray_48.gif\" /></div></div>";
};

var createSectionOPTION = function(id, name){
  return "<option id=\"section_option_" + id + "\" value=\"" + id + "\">" + name + "</option>";
};

var createSectionOrderLI = function(id, name){
  return "<li id=\"section_item_" + id + "\" class=\"ui-state-default\"><span class=\"ui-icon\"><input type=\"hidden\" value=\"" + id + "\" /></span><span class=\"label\">" + name + "</span></li>";
};

var loadSection = function(sectionId, typeId){
  if (!sectionId) return;
  var projectId = jQuery("#project_id").val();
  var url = "/aperture/section/" + sectionId;
  var params = {"project_id" : projectId};
  jQuery.post(url, params).done(function(html){
    jQuery("#section_" + sectionId).html(html);
    if (typeId === 6){
      loadXML(sectionId);
    }
  });
};

var dialogs = {};
jQuery(function(){
  dialogs["edit_header"] = jQuery("#edit_header").dialog(buildDialogProperties({"width" : 500, "height" : 280}));
  dialogs["create_section"] = jQuery("#create_section").dialog(buildDialogProperties({"width" : 500, "height" : 160}));
  dialogs["edit_section"] = jQuery("#edit_section").dialog(buildDialogProperties({"width" : 500, "height" : 160}));
  dialogs["arrange_sections"] = jQuery("#arrange_sections").dialog(buildDialogProperties({"width" : 500, "height" : 400}));
  dialogs["create_file"] = jQuery("#create_file").dialog(buildDialogProperties({"width" : 500, "height" : 240}));
  dialogs["add_file"] = jQuery("#add_file").dialog(buildDialogProperties({"width" : 500, "height" : 110}));
  dialogs["arrange_files"] = jQuery("#arrange_files").dialog(buildDialogProperties({"width" : 500, "height" : 400}));
  dialogs["edit_memo"] = jQuery("#edit_memo").dialog(buildDialogProperties({"width" : 500, "height" :160}));
  dialogs["create_alarm"] = jQuery("#create_alarm").dialog(buildDialogProperties({"width" : 500, "height" : 280}));
  dialogs["edit_alarm"] = jQuery("#edit_alarm").dialog(buildDialogProperties({"width" : 500, "height" : 280}));
  dialogs["setup_checklist"] = jQuery("#setup_checklist").dialog(buildDialogProperties({"width" : 500, "height" : 110}));
  dialogs["post_task"] = jQuery("#post_task").dialog(buildDialogProperties({"width" : 500, "height" : 240}));
  dialogs["setup_xml"] = jQuery("#setup_xml").dialog(buildDialogProperties({"width" : 500, "height" : 160}));

  jQuery("#section_order").sortable();
  jQuery("#section_order").disableSelection();
  jQuery("#file_order").sortable();
  jQuery("#file_order").disableSelection();
});

var openFile = function(projectId, sectionId, fileId){
  window.open("/aperture/file/" + projectId + "/" + sectionId + "/" + fileId, "_self");
};

var openProject = function(projectId){
  window.open("/aperture/project/" + projectId, "_self");
};

var openEditHeaderDialog = function(){
  var options = {};
  var beforeOpen = function(){
    var tag = jQuery("#tag").text();
    if (tag && tag.length){
      tag = tag.slice(1);
      tag = tag.slice(0, tag.length - 1);
    }
    var statusId = jQuery("#project_status_id").val();
    var description = jQuery("#description .content").text();
    jQuery("#edit_header_tag").val(tag);
    jQuery("#edit_header_status_id").val(statusId);
    jQuery("#edit_header_description").val(description);
  };
  openDialog("edit_header", options, beforeOpen);
};

var renameProject = function(){
  var confirmed = confirm("Changing project name.  Continue?");
  if (!confirmed) return;
  closeDialog("edit_header");
  var projectId = jQuery("#project_id").val();
  var name = jQuery("#edit_header_name").val();
  var url = "/aperture/project/rename";
  var params = {"project_id" : projectId, "name" : name};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT rename project.");
      return;
    }
    openProject(projectId);
  });
};

var saveHeader = function(){
  closeDialog("edit_header");
  var projectId = jQuery("#project_id").val();
  var tag = jQuery("#edit_header_tag").val();
  var statusId = jQuery("#edit_header_status_id").val();
  var description = jQuery("#edit_header_description").val();
  var url = "/aperture/project/save/header";
  var params = {"project_id" : projectId, "tag" : tag, "status_id" : statusId, "description" : description};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT update header.");
      return;
    }
    openProject(projectId);
  });
};

var createSection = function(){
  closeDialog("create_section");
  var projectId = jQuery("#project_id").val();
  var name = jQuery("#create_section_name").val();
  var typeId = jQuery("#create_section_type_id").val();
  var url = "/aperture/section/create";
  var params = {"project_id" : projectId, "name" : name, "type_id" : typeId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT create section.");
      return;
    }
    var id = result.id;
    var name = result.name;
    var div = createSectionDIV(id);
    var option = createSectionOPTION(id, name);
    var item = createSectionOrderLI(id, name);
    jQuery(".section").last().after(div);
    jQuery("#edit_section_id").append(option);
    jQuery("#section_order").append(item);
    loadSection(id);
  });
};

var renameSection = function(){
  closeDialog("edit_section");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#edit_section_id").val();
  var name = jQuery("#edit_section_name").val();
  var url = "/aperture/section/rename/" + sectionId;
  var params = {"project_id" : projectId, "name" : name};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT rename section.");
      return;
    }
    var sectionName = result.name;
    jQuery("#section_" + sectionId + " div .header span").text(sectionName);
    jQuery("#section_option_" + sectionId).text(sectionName);
    jQuery("#section_item_" + sectionId + " .label").text(sectionName);
  });
};

var removeSection = function(){
  var confirmed = confirm("This will remove the selected section.  Continue?");
  if (!confirmed) return;
  closeDialog("edit_section");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#edit_section_id").val();
  var url = "/aperture/section/remove/" + sectionId;
  var params = {"project_id" : projectId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT rename section.");
      return;
    }
    jQuery("#section_" + sectionId).remove();
    jQuery("#section_option_" + sectionId).remove();
    jQuery("#section_item_" + sectionId).remove();
  });
};

var updateSectionOrder = function(){
  closeDialog("arrange_sections");
  var projectId = jQuery("#project_id").val();
  var order = [];
  jQuery("#section_order li").each(function(){
    var value = jQuery(this).find("input").val();
    order.push(value);
  });
  var url = "/aperture/sections/reorder";
  var params = {"project_id" : projectId, "order" : JSON.stringify(order)};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT rearrange sections.");
      return;
    }
    loadAllSections();
  });
};

var showSectionLinks = function(sectionId){
  jQuery("#section_" + sectionId + " .links").fadeIn(250);
};

var hideSectionLinks = function(sectionId){
  jQuery("#section_" + sectionId + " .links").fadeOut(250);
};

var openCreateFileDialog = function(sectionId){
  jQuery("#section_id").val(sectionId);
  openDialog("create_file");
};

var openAddFileDialog = function(sectionId){
  jQuery("#section_id").val(sectionId);
  openDialog("add_file");
};

var openArrangeFilesDialog = function(sectionId){
  jQuery("#section_id").val(sectionId);
  jQuery("#file_order li").remove();
  openDialog("arrange_files");
  var url = "/aperture/section/files/" + sectionId;
  jQuery.get(url).done(function(result){
    if (result.error){
      alert("Could NOT initialize dialog.");
      return;
    }
    var html = "";
    var files = result.files;
    for (var i = 0; i < files.length; i++){
      var file = files[i];
      html += createFileOrderLI(sectionId, file.id, file.title);
    }
    jQuery("#file_order").append(html);
  });
};

var createFileOrderLI = function(sectionId, id, title){
  return "<li id=\"file_item_" + sectionId + "_" + id + "\" class=\"ui-state-default\"><span class=\"ui-icon\"><input type=\"hidden\" value=\"" + id + "\" /></span><span class=\"label\">" + title + "</span></li>";
};

var createFile = function(){
  closeDialog("create_file");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var title = jQuery("#create_file_title").val();
  var description = jQuery("#create_file_description").val();
  var typeId = jQuery("#create_file_type_id").val();
  var url = "/aperture/file/create";
  var params = {"project_id" : projectId, "section_id" : sectionId, "title" : title, "description" : description, "type_id" : typeId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT create file.");
      return;
    }
    loadSection(sectionId);
  });
};

var addFile = function(){
  closeDialog("add_file");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var fileId = jQuery("#add_file_id").val();
  var url = "/aperture/file/add";
  var params = {"project_id" : projectId, "section_id" : sectionId, "file_id" : fileId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT add file.");
      return;
    }
    loadSection(sectionId);
  });
};

var updateFileOrder = function(){
  closeDialog("arrange_files");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var order = [];
  jQuery("#file_order li").each(function(){
    var value = $(this).find("input").val();
    order.push(value);
  });
  var url = "/aperture/files/reorder";
  var params = {"project_id" : projectId, "section_id" : sectionId, "order" : JSON.stringify(order)};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT rearrange files.");
      return;
    }
    loadSection(sectionId);
  });
};

var openEditMemoDialog = function(sectionId, fileId){
  jQuery("#section_id").val(sectionId);
  jQuery("#file_id").val(fileId);
  var options = {};
  var beforeOpen = function(){
    var memo = jQuery("#memo_" + sectionId + "_" + fileId).text();
    jQuery("#edit_memo_content").val(memo);
  };
  openDialog("edit_memo", options, beforeOpen);
};

var saveMemo = function(){
  closeDialog("edit_memo");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var fileId = jQuery("#file_id").val();
  var content = jQuery("#edit_memo_content").val();
  var url = "/aperture/file/save/content/" + fileId;
  var params = {"project_id" : projectId, "content" : content};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT save memo.");
      return;
    }
    loadSection(sectionId);
  });
};

var clearMemo = function(sectionId, fileId){
  var confirmed = confirm("This will clear the contents of the memo.  Continue?");
  if (!confirmed) return;
  var projectId = jQuery("#project_id").val();
  var url = "/aperture/file/save/content/" + fileId;
  var params = {"project_id" : projectId, "content" : ""};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT save memo.");
      return;
    }
    loadSection(sectionId);
  });
};

var openCreateAlarmDialog = function(sectionId){
  jQuery("#section_id").val(sectionId);
  openDialog("create_alarm");
};

var openEditAlarmDialog = function(sectionId, alarmId, label, comment, warning, schedule){
  jQuery("#section_id").val(sectionId);
  jQuery("#alarm_id").val(alarmId);
  var options = {};
  var beforeOpen = function(){
    jQuery("#edit_alarm_label").val(label);
    jQuery("#edit_alarm_comment").val(comment);
    jQuery("#edit_alarm_warning").val(warning);
    jQuery("#edit_alarm_schedule").val(schedule);
  };
  openDialog("edit_alarm", options, beforeOpen);
};

var createAlarm = function(){
  closeDialog("create_alarm");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var label = jQuery("#create_alarm_label").val();
  var comment = jQuery("#create_alarm_comment").val();
  var warning = jQuery("#create_alarm_warning").val();
  var schedule = jQuery("#create_alarm_schedule").val();
  var url = "/aperture/alarm/create";
  var params = {"project_id" : projectId, "section_id" : sectionId, "label" : label, "comment" : comment, "warning" : warning, "schedule" : schedule};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT create alarm.");
      return;
    }
    loadSection(sectionId);
  });
};

var saveAlarm = function(){
  closeDialog("edit_alarm");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var alarmId = jQuery("#alarm_id").val();
  var label = jQuery("#edit_alarm_label").val();
  var comment = jQuery("#edit_alarm_comment").val();
  var warning = jQuery("#edit_alarm_warning").val();
  var schedule = jQuery("#edit_alarm_schedule").val();
  var url = "/aperture/alarm/save";
  var params = {"project_id" : projectId, "alarm_id" : alarmId, "label" : label, "comment" : comment, "warning" : warning, "schedule" : schedule};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT save alarm.");
      return;
    }
    loadSection(sectionId);
  });
};

var removeAlarm = function(){
  var confirmed = confirm("This will remove the selected alarm.  Continue?");
  if (!confirmed) return;
  closeDialog("edit_alarm");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var alarmId = jQuery("#alarm_id").val();
  var url = "/aperture/alarm/remove";
  var params = {"project_id" : projectId, "alarm_id" : alarmId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT remove alarm.");
      return;
    }
    loadSection(sectionId);
  });
};

var snoozeAlarm = function(){
  var confirmed = confirm("The alarm will be cleared from the dashboard if it is currently active.  Continue?");
  if (!confirmed) return;
  closeDialog("edit_alarm");
  var projectId = jQuery("#project_id").val();
  var alarmId = jQuery("#alarm_id").val();
  var url = "/aperture/alarm/snooze";
  var params = {"project_id" : projectId, "alarm_id" : alarmId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT snooze alarm.");
      return;
    }
  });
};

var toggleTaskState = function(div){
  if (!div) return;
  var state = jQuery(div).attr("class");
  if (state === "unchecked") state = "checked";
  else if (state === "checked") state = "crossed";
  else state = "unchecked";
  jQuery(div).attr("class", state);
};

var openSetupChecklistDialog = function(sectionId){
  jQuery("#section_id").val(sectionId);
  openDialog("setup_checklist");
};

var openPostTaskDialog = function(sectionId, checklistId){
  jQuery("#section_id").val(sectionId);
  jQuery("#checklist_id").val(checklistId);
  openDialog("post_task");
};

var setupChecklist = function(){
  closeDialog("setup_checklist");
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var checklistId = jQuery("#setup_checklist_id").val();
  var url = "/aperture/checklist/setup";
  var params = {"project_id" : projectId, "section_id" : sectionId, "checklist_id" : checklistId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT setup checklist.");
      return;
    }
    loadSection(sectionId);
  });
};

var postTask = function(){
  closeDialog("post_task");
  var sectionId = jQuery("#section_id").val();
  var checklistId = jQuery("#checklist_id").val();
  var description = jQuery("#post_task_description").val();
  var comments = jQuery("#post_task_comments").val();
  var url = "/aperture/checklist/post";
  var params = {"checklist_id" : checklistId, "description" : description, "comments" : comments};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT post task.");
      return;
    }
    loadSection(sectionId);
  });
};

var gotoChecklist = function(checklistId){
  window.open("/crosscheck/" + checklistId, "_self");
};

var applyChecklistChanges = function(sectionId, checklistId){
  var confirmed = confirm("The marked changes in the checklist will be applied.  Continue?");
  if (!confirmed) return;
  var checked = [];
  jQuery("#checklist_" + checklistId + " .task .checked").each(function(){
    checked.push(jQuery(this).attr("id"));
  });

  var crossed = [];
  jQuery("#checklist_" + checklistId + " .task .crossed").each(function(){
    crossed.push(jQuery(this).attr("id"));
  });

  var url = "/aperture/checklist/apply";
  var params = {"checklist_id" : checklistId, "checked" : JSON.stringify(checked), "crossed" : JSON.stringify(crossed)};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT apply changes.");
      return;
    }
    loadSection(sectionId);
  });  
};

var openSetupXMLDialog = function(sectionId){
  jQuery("#section_id").val(sectionId);
  openDialog("setup_xml");
};

var setupXML = function(){
  closeDialog("setup_xml");
  var sectionId = jQuery("#section_id").val();
  var xmlId = jQuery("#setup_xml_file_id").val();
  var xslId = jQuery("#setup_xml_xsl_id").val();
  var url = "/aperture/xml/setup";
  var params = {"section_id" : sectionId, "xml_id" : xmlId, "xsl_id" : xslId};
  jQuery.post(url, params, function(result){
    if (result.error){
      alert("Could NOT setup checklist.");
      return;
    }
    loadSection(sectionId, 6);
  });
};

var loadXML = function(sectionId){
  var url = "/aperture/xml/data";
  var params = {"section_id" : sectionId};
  jQuery.post(url, params, function(data){
    if (!data) return;
    var xml = data.xml;
    var xsl = data.xsl;
    if (!xml || !xsl) return;
    var dataXML = jQuery.parseXML(xml);
    var dataXSL = jQuery.parseXML(xsl);
    var xslt = new XSLTProcessor();
    xslt.importStylesheet(dataXSL);
    var content = xslt.transformToFragment(dataXML, document);
    jQuery("#section_" + sectionId + " .content").append(content);
  });
};

var closeProject = function(){
  window.open("/aperture", "_self");
}
