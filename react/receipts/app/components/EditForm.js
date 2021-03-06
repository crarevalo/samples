import React, {Fragment} from "react";
import TextField from "../../../shared/TextField.js";
import ActionLink from "../../../shared/ActionLink.js";

const EditForm = ({className, onChange, onSave, vendor, amount, date, path}) =>
  <div className={className}>
    <div>
      <TextField onChange={onChange} name="vendor" value={vendor} className="form-field" label="Vendor:" size="12" maxLength="50" />
    </div>
    <div>
      <TextField onChange={onChange} name="amount" value={amount} className="form-field" label="Amount:" size="8" />
    </div>
    <div>
      <TextField onChange={onChange} name="date" value={date} className="form-field" label="Date:" size="8" />
    </div>
    <div>
      <ActionLink onClick={onSave} className="link">Save Changes</ActionLink>
    </div>
  </div>

export default EditForm;
