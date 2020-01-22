import React from "react";

const RecipeList = ({className, recipes, onClick}) =>
  <div className={className}>
    {
      recipes &&
      recipes.map(recipe =>
        <div key={"list_item_" + recipe.id} className="list-item" onClick={() => onClick(recipe.id)}>
          <div className="name"><span>{recipe.name}</span></div>
          <div className="description"><span>{recipe.description}</span></div>
        </div>
      )
    }
  </div>

export default RecipeList;
