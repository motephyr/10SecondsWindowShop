'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddImagePathToItemSchema extends Schema {
  up () {
    this.table('items', (table) => {
      // alter table
      table.string('image_path')
    })
  }

  down () {
    this.table('items', (table) => {
          this.drop('image_path')
      // reverse alternations
    })
  }
}

module.exports = AddImagePathToItemSchema
