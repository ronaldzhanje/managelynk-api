exports.up = async function (knex) {
  await knex.schema.createTable('messages', function (table) {
    table.increments('id').primary();
    table.integer('work_order_id').notNullable().references('id').inTable('work_orders').onDelete('CASCADE');
    table.integer('user_id').nullable().references('id').inTable('users').onDelete('CASCADE'); // null for AI messages
    table.json('message').notNullable(); // The actual text message content
    table.timestamps(true, true); // created_at and updated_at
    
    // Indexes for better query performance
    table.index('work_order_id');
    table.index('created_at');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('messages');
};
