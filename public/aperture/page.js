function showHeaderLinks(){
  jQuery("#header .links").fadeIn(250);
}

function hideHeaderLinks(){
  jQuery("#header .links").fadeOut(250);
}

function showContentLinks(){
  jQuery("#body .links span").fadeIn(250);
}

function hideContentLinks(){
  jQuery("#body .links span").fadeOut(250);
}

function toggleOptional(){
  var field = jQuery("form[name='project_fields'] input[name='optional_flag']");
  var flag = (field && (field.val() === "1"));
  if (flag) jQuery(".optional").fadeOut(250);
  else jQuery(".optional").fadeIn(250);
  jQuery("#optional").text(flag ? "more" : "less");
  field.val(flag ? "0" : "1");
}

function addToSession(){
  var url = "/session/page/add";
  var params = {"url" : window.location.pathname};
  jQuery.post(url, params).done();
}
