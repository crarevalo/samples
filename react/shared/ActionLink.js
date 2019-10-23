import React from "react";

const Button = ({
  onClick,
  className = "",
  children
}) =>
  <span className={className}>[<a href="#" onClick={onClick}>{children}</a>]</span>

export default Button;
