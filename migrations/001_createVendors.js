exports.up = async function (knex) {
  await knex.schema.createTable('vendors', function (table) {
    table.increments('id').primary();
    table.string('businessName').notNullable().unique();
    table.string('licenseType');
    table.string('licenseNo').unique();
    table.string('licenseStatus');
    table.date('issueDate');
    table.date('expirationDate');
    table.string('addressLine1');
    table.string('addressLine2');
    table.string('city');
    table.string('state');
    table.string('zipcode');
    table.string('phone');
    table.string('disciplinaryAction');
    table.string('docketNumber');
    table.string('email');
    table.json('qualifier');
    table.string('primaryContactName');
    table.json('services');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('vendors');
}; 