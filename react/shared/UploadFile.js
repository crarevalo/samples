import React, {Fragment} from "react";
import ActionLink from "./ActionLink.js";

const formStyle = {
  display : "none"
};

const fileSelectionStyle = {
  fontStyle : "italic"
};

const uploadTargetStyle = {
  width : "0px",
  height : "0px",
  border : "0px solid #FFFFFF"
};

let submitFlag = false;

function onSelectFile(){
  jQuery("#upload_form input[name='upload_file']").click();
}

function onSelectFileChange(){
  const filename = jQuery("#upload_form input[name='upload_file']").val();
  jQuery("#file_selection").html(filename);
}

function onSubmit(){
  submitFlag = true;
  jQuery("#upload_form").submit();
}

function onIFrameLoad(uploadCallback){
  if (submitFlag && uploadCallback){
    uploadCallback.call();
    submitFlag = false;
  }
}

const UploadFile = ({location, onUpload}) =>
  <Fragment>
    <ActionLink onClick={onSelectFile} className="link">Select File</ActionLink>
    <span id="file_selection" style={fileSelectionStyle}>&lt;none&gt;</span>
    <ActionLink onClick={onSubmit} className="link">Upload</ActionLink>
    <UploadForm location={location} onSelectFileChange={onSelectFileChange} onUpload={() => onIFrameLoad(onUpload)} />
  </Fragment>

const UploadForm = ({location, onSelectFileChange, onUpload}) =>
  <form id="upload_form" name="upload_form" action="/grandeur/receipts/upload" encType="multipart/form-data" method="post" target="upload_target" style={formStyle}>
    <input type="hidden" name="location" value={location} />
    <input type="file" id="upload_file" name="upload_file" size="20" onChange={onSelectFileChange} />
    <input type="submit" name="action" value="Upload" />
    <iframe id="upload_target" name="upload_target" src="" onLoad={onUpload}></iframe>
  </form>

export default UploadFile;
