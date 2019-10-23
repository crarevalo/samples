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

function displayEmail(email_id, path){
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  if (!overlay || !dialog) return;
  var document_height = jQuery(document).height();
  var viewport_height = jQuery(window).height();
  var scroll_top = jQuery(window).scrollTop();
  var dialog_top = Math.max(((viewport_height - 800) / 2), 0) + scroll_top;
  overlay.css("width", "100%");
  overlay.css("height", document_height + "px");
  dialog.css("top", dialog_top + "px");
  dialog.html("<img src='/ajax_loader_gray_48.gif' />");
  overlay.css("display", "block");
  var url = "/hindsight/email";
  var params = {"email_id" : email_id, "path" : path};
  jQuery.get(url, params).done(function(data){
    dialog.html("");
    var header = data.header;
    dialog.html(header);
    var xml = data.xml;
    var xsl = data.xsl;
    var xml_doc = jQuery.parseXML(xml);
    var xsl_doc = jQuery.parseXML(xsl);
    var xslt = new XSLTProcessor();
    xslt.importStylesheet(xsl_doc);
    var result_doc = xslt.transformToFragment(xml_doc, document);
    dialog.append(result_doc);
    dialog.css("display", "block");
  });
}

function hideDisplay(){
  var overlay = jQuery("#overlay");
  var dialog = jQuery("#dialog");
  if (!overlay || !dialog) return;
  overlay.css("display", "none");
  dialog.html("");
}

