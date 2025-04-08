exports.up = async function (knex) {
  await knex.schema.createTable('work_orders', function (table) {
    table.increments('id').primary();
    table.text('description').notNullable();
    table.string('location').notNullable();
    table.string('photo').nullable();
    table.integer('user_id').notNullable();
    table.string('status').nullable();
    table.date('scheduled_date').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('work_orders');
}; 