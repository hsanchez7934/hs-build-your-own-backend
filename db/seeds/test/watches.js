const watchBrandsArray = require('../../../mockData/watch-brands.js');
const watchModelsArray = require('../../../mockData/watch-models.js');

exports.seed = function(knex, Promise) {
  return knex('watch_models').del()
    .then(() => knex('watch_brands').del())
    .then(() => {
      return Promise.all([
        knex('watch_brands').insert([
          { brand: 'Jaeger-LeCoultre', id: 1 },
          { brand: 'Patek Philippe & Co.', id: 2 }
        ])
          .then(brands => {
            return knex('watch_models').insert([
              {
                brand: 'Jaeger-LeCoultre',
                model: 'Master Compressor Extreme World Chronograph',
                price: 10200,
                id: 10,
                brand_id: 1
              },
              {
                brand: 'Jaeger-LeCoultre',
                model: 'Master Ultra Thin Perpetual Calendar',
                price: 15500,
                id: 11,
                brand_id: 1
              },
              {
                brand: 'Jaeger-LeCoultre',
                model: 'Master Minute Repeater Antoine LeCoultre Watch',
                price: 144700,
                id: 12,
                brand_id: 1
              },
              {
                brand: 'Jaeger-LeCoultre',
                model: 'Geophysic Universal Time',
                price: 9900,
                id: 13,
                brand_id: 1
              },
              {
                brand: 'Jaeger-LeCoultre',
                model: 'Master Compressor Chronograph Ceramic & Rose Gold',
                price: 11750,
                id: 14,
                brand_id: 1
              },
              {
                brand: 'Patek Philippe & Co.',
                model: 'Grand Complications Annual Calendar Moonphase White Gold',
                price: 70999,
                id: 15,
                brand_id: 2
              },
              {
                brand: 'Patek Philippe & Co.',
                model: 'Grand Complications Platinum Black Strap',
                price: 87999,
                id: 16,
                brand_id: 2
              },
              {
                brand: 'Patek Philippe & Co.',
                model: 'Sky Moon Tourbillon 6002',
                price: 1690000,
                id: 17,
                brand_id: 2
              },
              {
                brand: 'Patek Philippe & Co.',
                model: '5110P World Time',
                price: 50000,
                id: 18,
                brand_id: 2
              },
              {
                brand: 'Patek Philippe & Co.',
                model: 'Split Seconds Chronograph & Perpetual Calendar',
                price: 279995,
                id: 19,
                brand_id: 2
              }
            ]);
          })
      ]);
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};
