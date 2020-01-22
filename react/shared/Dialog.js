import React from "react";
import PropTypes from "prop-types";

const overlayStyle = {
  position : "fixed",
  top : "0px",
  bottom : "0px",
  left : "0px",
  right : "0px",
  backgroundColor : "rgba(180, 180, 180, 0.5)",
  display : "flex",
  alignItems : "center"
};

const handleDialogClick = function(event, callback){
  event.stopPropagation();
  if (callback) callback.call();
}

const Dialog = ({isOpen, dialogClassName, onClickDialog, onClickOverlay, children}) =>
  isOpen &&
  <div style={overlayStyle} onClick={onClickOverlay}>
    <div className={dialogClassName} onClick={(event) => handleDialogClick(event, onClickDialog)}>{children}</div>
  </div>

Dialog.propTypes = {
  isOpen : PropTypes.bool.isRequired,
  dialogClassName : PropTypes.string,
  onClickDialog : PropTypes.func,
  onClickOverlay : PropTypes.func
};

export default Dialog;
