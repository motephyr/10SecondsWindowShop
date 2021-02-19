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
  Route.post('/users/update', "v1/UserController.update");
  Route.get('/items/myitems', 'v1/ItemController.myitems')
  Route.post('/items', "v1/ItemController.store");
  Route.patch('/items/:id', "v1/ItemController.update");
  Route.delete('/items/:id', "v1/ItemController.destroy");
}).prefix('/v1').middleware(['auth:jwt'])

Route.group(() => {
  Route.get('/items', 'v1/ItemController.index')
  Route.get('/items/:id', 'v1/ItemController.show')
}).prefix('/v1')

