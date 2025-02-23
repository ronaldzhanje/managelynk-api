exports.up = async function (knex) {
  await knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users');
}; 