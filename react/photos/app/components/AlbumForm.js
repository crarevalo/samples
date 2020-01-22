import React from "react";
import TextField from "../../../shared/TextField.js";
import TextBox from "../../../shared/TextBox.js";

const AlbumForm = ({className, onChange, values}) =>
  <div className={className}>
    <div className="section"> 
      <TextField onChange={onChange} name="title" value={values.title} className="form-field" label="Title:" size="40" maxLength="40" />
    </div>
    <div className="section">
      <TextBox onChange={onChange} name="description" content={values.description} label="Description:" className="form-field" isVertical="true" />
    </div>  
    <div className="section">
      <TextField onChange={onChange} name="year" value={values.year} className="form-field" label="Year:" size="8" maxLength="4" />
      <TextField onChange={onChange} name="month" value={values.month} className="form-field" label="Month:" size="6" maxLength="2" />
      <TextField onChange={onChange} name="date" value={values.date} className="form-field" label="Date:" size="6" maxLength="2" />
    </div>
  </div>

export default AlbumForm;
