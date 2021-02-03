'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ItemsSchema extends Schema {
  up () {
    this.create('items', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('title')
      table.decimal('price')
      table.string('video_path')
      table.enu('status',['draft', 'publish', 'deleted', 'sold_out'])
      table.timestamp('last_drafted_at')
      table.timestamp('last_publish_at')
      table.timestamp('last_deleted_at')
      table.timestamp('last_sold_out_at')
      table.integer('view_count').defaultTo(0)
      table.integer('total_watch_time').defaultTo(0)
      table.integer('record_count').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('items')
  }
}

module.exports = ItemsSchema
