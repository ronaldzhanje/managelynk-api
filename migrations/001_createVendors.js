exports.up = async function (knex) {
  await knex.schema.createTable('vendors', function (table) {
    table.increments('id').primary();
    table.string('businessName').notNullable();
    table.string('primaryContactName').notNullable();
    table.string('serviceType').notNullable();
    table.string('email');
    table.string('phone');
    table.specificType('service_area', 'text[]');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('vendors');
}; 