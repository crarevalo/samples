import React from "react";

const overlayStyle = {
  position : "fixed",
  top : "0px",
  bottom : "0px",
  left : "0px",
  right : "0px",
  backgroundColor : "rgba(0, 0, 0, 0.3)",
  display : "flex",
  alignItems : "center"
};

const Dialog = ({dialogClassName, children}) =>
  <div style={overlayStyle}>
    <div className={dialogClassName}>{children}</div>
  </div>

export default Dialog;
