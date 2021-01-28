'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddRoleToUsersSchema extends Schema {
  up() {
    this.table('users', (table) => {
      // alter table
      table.enum('role', ['buyer', 'seller']).defaultTo('buyer')

    })
  }

  down() {
    this.table('users', (table) => {
      // reverse alternations
      table.dropColumn('role')
    })
  }
}

module.exports = AddRoleToUsersSchema
