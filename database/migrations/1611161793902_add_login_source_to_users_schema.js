'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddLoginSourceToUsersSchema extends Schema {
  up() {
    this.table('users', (table) => {
      table.string('login_source', 15).notNullable().defaultTo('email');
    })
  }

  down() {
    this.table('users', (table) => {
      table.dropColumn('login_source');
    })
  }
}

module.exports = AddLoginSourceToUsersSchema
