exports.up = async function (knex) {
  await knex.schema.createTable('vendors', function (table) {
    table.increments('id').primary();
    table.string('businessName').notNullable();
    table.string('licenseType');
    table.string('licenseNo');
    table.string('licenseStatus');
    table.date('issueDate');
    table.date('expirationDate');
    table.string('addrLine1');
    table.string('addrLine2');
    table.string('city');
    table.string('state');
    table.string('zipcode');
    table.string('phone');
    table.string('disciplinaryAction');
    table.string('docketNumber');
    table.string('email');
    table.json('qualifier');
    table.string('primaryContactName');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('vendors');
}; 