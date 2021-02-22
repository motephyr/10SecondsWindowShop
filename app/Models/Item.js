'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Item extends Model {
  user() {
    return this.belongsTo('App/Models/User')
  }

  records(){
    return this.hasMany('App/Models/Record')
  }
}

module.exports = Item
