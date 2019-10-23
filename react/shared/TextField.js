import React from "react";

const TextField = ({label, className, ...rest}) =>
  <span className={className}>
    <label>{label}</label>
    <input type="text" {...rest} />
  </span>

export default TextField;
