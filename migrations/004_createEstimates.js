exports.up = async function (knex) {
  await knex.schema.createTable('estimates', function (table) {
    // Primary key
    table.increments('id').primary();

    // Foreign key for work_orders table
    table.integer('work_order_id').unsigned().notNullable();
    table.foreign('work_order_id')
         .references('id')
         .inTable('work_orders')
         .onDelete('CASCADE'); // If a work order is deleted, delete associated estimates

    // Foreign key for vendors table
    table.integer('vendor_id').unsigned().notNullable();
    table.foreign('vendor_id')
         .references('id')
         .inTable('vendors')
         .onDelete('CASCADE'); // If a vendor is deleted, delete associated estimates

    // Cost column (using decimal for currency)
    table.decimal('cost', 10, 2).notNullable(); // Precision 10, Scale 2

    // File path/URL column (nullable)
    table.string('file').nullable();

    // Timestamps
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('estimates');
}; 