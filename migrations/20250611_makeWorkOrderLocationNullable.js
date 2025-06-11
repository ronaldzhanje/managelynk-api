exports.up = async function (knex) {
  await knex.schema.alterTable('work_orders', function (table) {
    table.string('location').nullable().alter();
  });
};

exports.down = async function (knex) {
  const nullLocations = await knex('work_orders')
    .whereNull('location')
    .count('id as count')
    .first();

  if (nullLocations.count > 0) {
    await knex('work_orders')
      .whereNull('location')
      .update('location', 'TBD');
  }

  await knex.schema.alterTable('work_orders', function (table) {
    table.string('location').notNullable().alter();
  });
};
