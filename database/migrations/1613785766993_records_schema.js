'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RecordsSchema extends Schema {
  up () {
    this.create('records', (table) => {
      table.increments()
      table.integer('seller_user_id').unsigned().references('id').inTable('users')
      table.integer('buyer_user_id').unsigned().references('id').inTable('users')
      table.integer('item_id').unsigned().references('id').inTable('items')
      table.timestamps()
    })
  }

  down () {
    this.drop('records')
  }
}

module.exports = RecordsSchema
