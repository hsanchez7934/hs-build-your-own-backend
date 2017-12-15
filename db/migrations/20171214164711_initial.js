
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('watch_brands', function(table) {
      table.increments('id').primary();
      table.string('brand');

      table.timestamps(true, true);
    }), //end watch_brands table

    knex.schema.createTable('watch_models', function(table) {
      table.increments('id').primary();
      table.string('model');
      table.integer('price');
      table.string('brand');
      table.integer('brand_id').unsigned();
      table.foreign('brand_id')
        .references('watch_brands.id');

      table.timestamps(true, true);
    }) //end watch_models table

  ]); //end promise.all
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('watch_models'),
    knex.schema.dropTable('watch_brands')
  ]); //end promise.all
};
