import React from "react";
import PropTypes from "prop-types";

const onClickLink = function(event, callback){
  event.preventDefault();
  if (callback) callback.call(this, event);
}

const Button = ({
  onClick,
  className = "",
  includingBrackets = true,
  children
}) =>
  <span className={className}>{includingBrackets ? "[" : ""}<a href="#" onClick={(event) => onClickLink(event, onClick)}>{children}</a>{includingBrackets ? "]" : ""}</span>

Button.propTypes = {
  onClick : PropTypes.func,
  className : PropTypes.string,
  includingBrackets : PropTypes.bool
};

export default Button;
