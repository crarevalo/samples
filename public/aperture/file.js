jQuery(document).ready(function(){
  var height = jQuery(window).height() - 150;
  jQuery("#page").css("min-height", height + "px");
  loadContent();
  initUploadForm();
});

var loadContent = function(onContentLoaded){
  var typeId = jQuery("form[name='project_fields'] input[name='type_id']").val();
  var editable = jQuery("form[name='project_fields'] input[name='editable']").val();
  var location = jQuery("form[name='project_fields'] input[name='location']").val();

  var pageHeight = jQuery("#page").height();
  var contentOffset = jQuery("#content").offset();
  var contentTop = contentOffset.top;
  var contentHeight = pageHeight - contentTop;

  if (typeId === "6"){ // pdf
    var url = "/aperture/file/data?filename=" + location;
    var html = "<object data=\"" + url + "\" width=\"100%\" height=\"" + contentHeight + "px\" type=\"application/pdf\" />";
    jQuery("#content").html(html);
    if (onContentLoaded) onContentLoaded();
  }
  else if ((typeId === "5") || (typeId === "13")){ // images
    var url = "/aperture/file/data?filename=" + location;
    var html = "<img src=\"" + url + "\" />";
    jQuery("#content").html(html);
    if (onContentLoaded) onContentLoaded();
  }
  else if (typeId === "7"){ // audio
    var url = "/aperture/file/data?filename=" + location;
    var html = "<audio src=\"" + url + "\" controls=\"controls\" preload=\"auto\" type=\"audio/mpeg\"><p>browser does NOT support tag</p></audio>";
    jQuery("#content").html(html);
    if (onContentLoaded) onContentLoaded();
  }
  else if (editable){ // text
    var url = "/aperture/file/data";
    var params = {"type_id" : typeId, "location" : location};
    jQuery.post(url, params, function(result){
      jQuery("#hash").val(result.hash);
      var html = "<pre>" + result.data + "</pre>";
      jQuery("#content").html(html);
      if (onContentLoaded) onContentLoaded();
    });
  }
};

var dialogs = {};
jQuery(function(){
  dialogs["edit_header"] = jQuery("#edit_header").dialog(buildDialogProperties({"width" : 500, "height" : 330}));
  dialogs["edit_content"] = jQuery("#edit_content").dialog(buildDialogProperties({"width" : 500, "height" : 200}));
  dialogs["upload_content"] = jQuery("#upload_content").dialog(buildDialogProperties({"width" : 500, "height" : 150}));
});

function openEditHeaderDialog(){
  var options = {};
  var beforeOpen = function(){
    var title = jQuery("#title").text() || "";
    var description = jQuery("#description").text() || "";
    var keywords = jQuery("#keywords").text() || "";
    jQuery("#edit_title").val(title);
    jQuery("#edit_description").val(description);
    jQuery("#edit_keywords").val(keywords);
  };
  openDialog("edit_header", options, beforeOpen);
}

function saveHeader(){
  closeDialog("edit_header");
  var url = "/aperture/file/save/header";
  var params = {
    "project_id" : jQuery("#project_id").val(),
    "section_id" : jQuery("#section_id").val(),
    "file_id" : jQuery("#file_id").val(),
    "title" : jQuery("#edit_title").val(),
    "description" : jQuery("#edit_description").val(),
    "date" : jQuery("#edit_created_date").val(),
    "time" : jQuery("#edit_created_time").val(),
    "keywords" : jQuery("#edit_keywords").val()
  };
  jQuery.post(url, params).done(function(result){
    if (result.error){
      alert("There were issues while saving the file header.");
    }
    else{
      jQuery("#title").text(result.title);
      jQuery("#description").text(result.description);
      jQuery("#created").text(result.createdString);
      jQuery("#keywords").text(result.keywords);
      adjustMarkupForKeywords(result.keywords);
    }
  });
}

function adjustMarkupForKeywords(keywords){
  if (!keywords) jQuery("#keywords").parent().remove();
  else{
    var span = jQuery("#keywords");
    if (span.length) span.text(keywords);
    else jQuery("#associated").after("<div class=\"optional\"><span class=\"label\">Keywords:</span><span id=\"keywords\" class=\"value\">" + keywords + "</span></div>");
    var display = jQuery("#associated").css("display");
    jQuery(".optional").css("display", display);
  }
};

function openEditContentDialog(){
  var field = jQuery("#edit_file_content");
  var content = jQuery("#content pre").text() || "";
  field.val(content);
  var width = jQuery("#page").width() - 10;
  var height = jQuery(window).height() - 20;
  field.css("width", (width - 50) + "px");
  field.css("height", (height - 100) + "px");
  var options = {"width" : width, "height" : height, position : {"at" : "center center", "of" : window}};
  openDialog("edit_content", options);
  field.focus();
  lockScrolling();
}

function saveContent(){
  var projectId = jQuery("#project_id").val();
  var fileId = jQuery("#file_id").val();
  var location = jQuery("#location").val();
  var content = jQuery("#edit_file_content").val() || "";
  var url = "/aperture/file/save/content";
  var params = {"project_id" : projectId, "file_id" : fileId, "location" : location, "content" : content};
  jQuery.post(url, params).done(function(result){
    if (result.error){
      alert("Could NOT save content.");
    }
    else{
      loadContent(function(){
        if (result.hash === jQuery("#hash").val()){
          alert("File saved successfully.");
          closeDialog("edit_content");
          unlockScrolling();
        }
        else{
          alert("Could NOT verify that file was saved.");
        }
      });
    }
  });
}

function openProject(projectId){
  window.open("/aperture/project/" + projectId, "_self");
}

function initUploadForm(){
  var form_upload = document.getElementById("upload_form");
  if (form_upload){
    form_upload.onsubmit = function(){ // to avoid page from receiving reponse
      form_upload.target = "upload_target"; // set iframe as target for upload
      document.getElementById("upload_target").onload = uploadCallback;
    };
  }
}

function uploadCallback(){
  closeDialog("upload_content");
  loadContent();
}

function selectUploadFile(){
  jQuery("#upload_form input[name='upload_file']").click();
}

function updateUploadDialog(){
  var filename = jQuery("#upload_form input[name='upload_file']").val();
  jQuery("#file_selection").html(filename);
}

function uploadFile(){
  jQuery("#upload_form").submit();
}

function detachFile(){
  var response = confirm("The file will no longer exist under the section from which it was opened.  Continue?");
  if (!response) return;
  var url = "/aperture/file/detach";
  var projectId = jQuery("#project_id").val();
  var sectionId = jQuery("#section_id").val();
  var fileId = jQuery("#file_id").val();
  var params = {"project_id" : projectId, "section_id" : sectionId, "file_id" : fileId};
  jQuery.post(url, params, function(result){
    if (result.error) alert("Could NOT detach file.");
    else{
      var projectId = jQuery("#project_id").val();
      openProject(projectId);
    }
  });
}
