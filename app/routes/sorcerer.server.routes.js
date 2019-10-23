var users = require("../../app/controllers/users.server.controller");
var sorcerer = require("../../app/controllers/sorcerer.server.controller");

module.exports = function(app){
  app.route("/sorcerer/recipes").get(users.requiresLogin, users.hasAuthorization, sorcerer.renderRecipes);
  app.route("/sorcerer/recipes/data").get(users.requiresLogin, users.hasAuthorization, sorcerer.getRecipesJSON);
  app.route("/sorcerer/recipes/create").post(users.requiresLogin, users.hasAuthorization, sorcerer.createRecipe);
  app.route("/sorcerer/recipes/update").post(users.requiresLogin, users.hasAuthorization, sorcerer.updateRecipe);
};
