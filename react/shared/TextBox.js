import React from "react";

const TextBox = ({
  content,
  onChange,
  onKeyPress,
  className
}) =>
  <textarea className={className} value={content} onChange={onChange} onKeyPress={onKeyPress}></textarea>

export default TextBox;
