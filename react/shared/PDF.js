import React from "react";

const PDF = ({url, className}) =>
  <object data={url} className={className} type="application/pdf" />;

export default PDF;
