import React, {Component, Fragment} from "react";
import axios from "axios";
import Recipe from "./Recipe.js";
import RecipeList from "./RecipeList.js";
import ActionLink from "../../../shared/ActionLink.js";

class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      mode : "home", // home | search | view | edit | new
      searchFields : {
        name : ""
      },
      searchResults : null,
      recipeData : {
        name : "",
        description : "",
        ingredients : null,
        process : null
      },
      formFields : {
        id : "",
        name : "",
        description : "",
        amount : "",
        units : "",
        ingredient : "",
        step : ""
      },
      editingRecipeName : false,
      error : null
    };

    this.onSearchOpen = this.onSearchOpen.bind(this);
    this.retrieveData = this.retrieveData.bind(this);
    this.onViewRecipe = this.onViewRecipe.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onRecipeFieldChange = this.onRecipeFieldChange.bind(this);
    this.onAddOpen = this.onAddOpen.bind(this);
    this.onAddIngredient = this.onAddIngredient.bind(this);
    this.onAddStep = this.onAddStep.bind(this);
    this.onRecipeSave = this.onRecipeSave.bind(this);
    this.onRecipeClose = this.onRecipeClose.bind(this);
    this.onClickRecipeName = this.onClickRecipeName.bind(this);
    this.onCancelRecipeName = this.onCancelRecipeName.bind(this);
  }

  componentDidMount(){
    this.retrieveData();
  }

  onSearchOpen(){
    this.setState({mode : "search"});
  }

  retrieveData(){
    const self = this;
    axios.get("/sorcerer/recipes/data").then(function(response){
      self.setState({searchResults : response.data});
    }).catch(function(error){
      self.setState({error});
    });
  }

  onViewRecipe(recipeId){
    const self = this;
    axios.get(`/sorcerer/recipe/retrieve/${recipeId}`).then(function(response){
      const formFields = {...self.state.formFields, name : response.data.name, description : response.data.description};
      self.setState({mode : "view", recipeData : response.data, formFields});
    }).catch(function(error){
      self.setState({error});
    });
  }

  onAddOpen(){
    this.setState({mode : "new"});
  }

  onRecipeFieldChange(event){
    const name = event.target.name;
    const value = event.target.value;

    if (name === "amount"){
      const regex = /^(\d*)$|^(\d*\.\d*)$/;
      if (!regex.test(value)) return;
    }
    this.setState({formFields : {...this.state.formFields, [name] : value}});
  }

  onAddIngredient(){
    const {formFields, recipeData} = this.state;
    let ingredients = recipeData.ingredients;
    if (!ingredients) ingredients = [];
    const ingredient = {key : "ingredients_" + ingredients.length, name : formFields.ingredient, amount : formFields.amount, units : formFields.units};
    ingredients.push(ingredient);
    formFields.amount = "";
    formFields.units = "";
    formFields.ingredient = "";
    this.setState({formFields, recipeData : {...recipeData, ingredients}});
  }

  onAddStep(){
    const {formFields, recipeData} = this.state;
    let process = recipeData.process;
    if (!process) process = [];
    const step = {key : "steps_" + process.length, description : formFields.step, step : process.length + 1};
    process.push(step);
    formFields.step = "";
    this.setState({formFields, recipeData : {...this.state.recipeData, process}});
  }

  onRecipeSave(){
    const {formFields, recipeData} = this.state;
    const self = this;
    const params = {
      method : "post",
      url : "/sorcerer/recipes/create",
      data : {
        name : formFields.name,
        description : formFields.description,
        ingredients : recipeData.ingredients,
        process : recipeData.process
      }
    };
    axios(params).then(function(response){
      alert(response.data.message);
      self.setState({mode : "view", recipeData : {...recipeData, name : formFields.name, description : formFields.description}});
    }).catch(function(error){
      self.setState({error});
    });
  }

  onRecipeClose(){
    this.setState({mode : "home"});
  }

  onClickRecipeName(){
    const formFields = {...this.state.formFields, name : this.state.recipeData.name};
    this.setState({editingRecipeName : true, formFields});
  }

  onCancelRecipeName(){
    this.setState({editingRecipeName : false});
  }

  onSearchSubmit(){

  }
  
  render(){
    const {mode, searchResults, formFields, recipeData, editingRecipeName} = this.state;
    switch (mode){
      case "search":
        return null;
      case "new":
      case "view":
      case "edit":
        return (
          <Recipe
            mode={mode}
            className={"recipe-" + mode}
            onChange={this.onRecipeFieldChange}
            onKeyPress={this.onRecipeFieldKeyPress}
            onAddIngredient={this.onAddIngredient}
            onAddStep={this.onAddStep}
            onSave={this.onRecipeSave}
            onClose={this.onRecipeClose}
            fields={formFields}
            data={recipeData}
            editingRecipeName={editingRecipeName}
            onClickRecipeName={this.onClickRecipeName}
            onCancelRecipeName={this.onCancelRecipeName} />
        );
      default:
        return (
          <Fragment>
            <div>
              <ActionLink onClick={this.onAddOpen} className="link">Add</ActionLink>
              <ActionLink onClick={this.onSearchOpen} className="link">Search</ActionLink>
            </div>
            <div>
              <RecipeList onClick={this.onViewRecipe} className="recipe-list" recipes={searchResults} />
            </div>
          </Fragment>
        );
    };

  }
}

export default App;
