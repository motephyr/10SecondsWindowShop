'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddInformationToUsersSchema extends Schema {
  up() {
    this.table('users', (table) => {
      table.text('information').notNullable().defaultTo('');
    })
  }

  down() {
    this.table('users', (table) => {
      table.dropColumn('information');
    })
  }
}

module.exports = AddInformationToUsersSchema
