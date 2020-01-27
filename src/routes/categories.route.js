//package Imports
const Express = require('express');

//EMR Workflow Controller Import
const cateoriesController = require('../controllers/categories.controller');

//Express Router Initialize
const categoriesRoute = Express.Router();

categoriesRoute.route('/create').post(cateoriesController.addCategories);
categoriesRoute.route('/getAll').get(cateoriesController.getAllCategories);
categoriesRoute.route('/delete').put(cateoriesController.deleteCategories);
categoriesRoute.route('/getById').post(cateoriesController.getCategoriesById);
categoriesRoute.route('/update').put(cateoriesController.updateCategories);

module.exports = categoriesRoute;
