'use strict'


require('./authRoutes.js');

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('page/index')
Route.on('/demo').render('page/demo')
Route.on('/checkout').render('page/checkout')

Route.post('/users/update', "UserController.update");

Route.get('/items', 'ItemController.index')
Route.get('/items/add', "ItemController.add");
Route.post('/items', "ItemController.store");


Route.group(() => {
  // 更新token
  Route.get('/items', 'v1/ItemController.index').middleware(['auth'])
  Route.post('/items', "v1/ItemController.store");

}).prefix('/v1')
