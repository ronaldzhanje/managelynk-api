exports.up = async function (knex) {
  await knex.schema.createTable('work_orders', function (table) {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.string('location').notNullable();
    table.string('photo').nullable();
    table.integer('user_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('work_orders');
}; 