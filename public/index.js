jQuery(document).ready(function(){
  var user = jQuery("#user"); // if user div exists, user is signed in
  if (!user) return;
  var timezone = moment.tz.guess();

console.log("timezone: " + JSON.stringify(timezone));

  var url = "/timezone";
  var params = {"timezone" : timezone};
  jQuery.post(url, params).done(function(result){});
});
