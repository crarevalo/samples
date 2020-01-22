import React from "react";

const TextField = ({label, className, refInput, ...rest}) =>
  <span className={className}>
    <label>{label}</label>
    <input type="text" ref={refInput} {...rest} />
  </span>

export default TextField;
