import React, {Fragment} from "react";
import TextField from "../../../shared/TextField.js";
import TextBox from "../../../shared/TextBox.js";
import ActionLink from "../../../shared/ActionLink.js";
import EditableCaption from "../../../shared/EditableCaption.js";

let refAmount = React.createRef();
let onAddIngredientCallback = null;
const addIngredient = function(){
  refAmount.focus();
  if (onAddIngredientCallback) onAddIngredientCallback.call();
};

let refStep = React.createRef();
let onAddStepCallback = null;
const addStep = function(callback){
  refStep.focus();
  if (onAddStepCallback) onAddStepCallback.call();
};

function onKeyPress(){
  const name = event.target.name;
  const value = event.target.value;

  if (name === "ingredient"){
    if (event.key === "Enter"){
      event.preventDefault();
      addIngredient();
    }
  }
  else if (name === "step"){
    if (event.key === "Enter"){
      event.preventDefault();
      addStep();
    }
  }
}

const Recipe = function({mode, className, onChange, onAddIngredient, onAddStep, onSave, onClose, fields, data, editingRecipeName, onClickRecipeName, onCancelRecipeName}){
  onAddIngredientCallback = onAddIngredient;
  onAddStepCallback = onAddStep;
  switch (mode){
    case "new":
    case "edit":
      return (
        <div className={className}>
          <div className="section">
            <TextField onChange={onChange} name="name" value={fields.name} className="form-field" label="Name:" size="20" maxLength="50" />
            <ActionLink onClick={onSave} className="link">Save Recipe</ActionLink>
            <ActionLink onClick={onClose} className="link">Close</ActionLink>
          </div>
          <div className="section">
            <TextBox onChange={onChange} name="description" content={fields.description} label="Description:" className="form-field" isVertical="true" />
          </div>
          <div className="section">
            <TextField refInput={element => refAmount = element} onChange={onChange} name="amount" value={fields.amount} className="form-field" label="Amount:" size="10" maxLength="12" />
            <TextField onChange={onChange} name="units" value={fields.units} className="form-field" label="Units:" size="10" maxLength="20" />
            <TextField onChange={onChange} onKeyPress={onKeyPress} name="ingredient" value={fields.ingredient} className="form-field" label="Ingredient:" size="10" maxLength="40" />
            <ActionLink onClick={addIngredient} className="link">Add</ActionLink>
          </div>
          <div className="section">
            <div className="list">
              {data.ingredients && data.ingredients.map(item => <div key={item.key}><Ingredient data={item} /></div>)}
            </div>
          </div>
          <div className="section steps-input">
            <div className="sub-section">
              <TextBox refInput={element => refStep = element} onChange={onChange} onKeyPress={onKeyPress} name="step" value={fields.step} label="Step:" className="form-field" isVertical="true" maxLength="500" />
            </div>
            <div className="sub-section step-link"><ActionLink onClick={addStep} className="link">Add</ActionLink></div>
          </div>
          <div className="section">
            <div className="list">
              {data.process && data.process.map(item => <div key={item.key}>{item.step}.&nbsp;{item.description}</div>)}
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className={className}>
          <div className="section">
            <div className="recipe-close"><ActionLink onClick={onClose} className="link">Close</ActionLink></div>
            <div><EditableCaption className="recipe-name" name="name" content={editingRecipeName ? fields.name : data.name} editing={editingRecipeName} onChange={onChange} onClick={onClickRecipeName} onSave="" onCancel={onCancelRecipeName} /></div>
            <div className="recipe-description"><span>{data.description}</span></div>
          </div>
          <div className="section">
            <div className="ingredient-list">
              {data.ingredients && data.ingredients.map(item => <div key={item.key}><Ingredient data={item} /></div>)}
            </div>
          </div>
          <div className="section">
            <div className="step-list">
              <table>
                <tbody>
                  {data.process && data.process.map(item =>
                    <tr key={item.key}>
                      <td key={item.key + "_step"}>{item.step}.</td>
                      <td key={item.key + "_description"}>{item.description}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
  };
};

const Ingredient = function({data}){
  const {key, amount, units, name} = data;
  if (amount && units) return (<Fragment>{amount}&nbsp;{units}&nbsp;of&nbsp;{name}</Fragment>);
  else if (amount && !units) return (<Fragment>{amount}&nbsp;{name}</Fragment>);
  else return (<Fragment>{name}</Fragment>);
};

export default Recipe;

