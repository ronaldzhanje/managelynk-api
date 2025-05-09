exports.up = async function(knex) {
  // Check if column exists
  const columnExists = await knex.schema.hasColumn('users', 'role');
  
  if (!columnExists) {
    return knex.schema.alterTable('users', table => {
      table.enum('role', ['USER', 'ADMIN']).defaultTo('USER');
    });
  }
  // If column exists, check if it has the correct check constraint
  else {
    const constraints = await knex.raw(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass 
      AND contype = 'c' 
      AND conname LIKE '%role%'
    `);
    
    if (constraints.rows.length === 0) {
      // Add the check constraint if it doesn't exist
      return knex.raw(`
        ALTER TABLE users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('USER', 'ADMIN'))
      `);
    }
  }
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('role');
  });
};
