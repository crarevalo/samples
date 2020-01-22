import React from "react";

const TextBox = ({
  label,
  content,
  onChange,
  onKeyPress,
  className,
  isVertical,
  refInput,
  ...rest
}) =>
  <div className={className}>
    <label>{label}</label>
    {isVertical && <br/>}
    <textarea ref={refInput} className={className} onChange={onChange} onKeyPress={onKeyPress} value={content} {...rest} />
  </div>

export default TextBox;
