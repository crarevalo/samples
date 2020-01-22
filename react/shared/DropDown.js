import React from "react";

const DropDown = ({elements, selected, onChange}) =>
  <select onChange={(event) => onChange(event)} value={selected}>
    {elements && elements.length && elements.map((element) =>
      <option key={element.label + "_" + element.value} value={element.value}>{element.label}</option>
    )}
  </select>

export default DropDown;
