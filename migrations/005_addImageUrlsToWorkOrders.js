exports.up = async function (knex) {
  // First add the new column
  await knex.schema.alterTable('work_orders', function (table) {
    table.json('images').nullable();
  });

  // Migrate existing photo data to images
  const workOrders = await knex('work_orders').select('id', 'photo');
  for (const order of workOrders) {
    if (order.photo) {
      await knex('work_orders')
        .where('id', order.id)
        .update('images', JSON.stringify([order.photo]));
    }
  }

  // Remove the old photo column
  await knex.schema.alterTable('work_orders', function (table) {
    table.dropColumn('photo');
  });
};

exports.down = async function (knex) {
  // First add back the photo column
  await knex.schema.alterTable('work_orders', function (table) {
    table.string('photo').nullable();
  });

  // Migrate data back from images to photo
  const workOrders = await knex('work_orders').select('id', 'images');
  for (const order of workOrders) {
    if (order.images) {
      const urls = JSON.parse(order.images);
      if (urls.length > 0) {
        await knex('work_orders')
          .where('id', order.id)
          .update('photo', urls[0]);
      }
    }
  }

  // Remove the images column
  await knex.schema.alterTable('work_orders', function (table) {
    table.dropColumn('images');
  });
}; 