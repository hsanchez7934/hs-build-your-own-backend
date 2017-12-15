const watchBrandsArray = require('../../../mockData/watch-brands.js');
const watchModelsArray = require('../../../mockData/watch-models.js');

const createBrand = (knex, brandName) => {
  return knex('watch_brands').insert({
    brand: brandName.brand
  }, 'id')
  .then(watchID => {
    let watchArray = [];
    let filteredArray = watchModelsArray.filter(watch => watch.brand === brandName.brand);
    filteredArray.forEach(filteredWatch => {
      watchArray.push(createWatch(knex, {
        brand: JSON.stringify(filteredWatch.brand),
        model: JSON.stringify(filteredWatch.model),
        price: filteredWatch.price,
        brand_id: watchID[0]
      }));
    })
    return Promise.all(watchArray);
  })
}

const createWatch = (knex, watch) => {
  return knex('watch_models').insert(watch);
}

exports.seed = function(knex, Promise) {
  return knex('watch_models').del()
  .then(() => knex('watch_brands').del())
  .then(() => {
    let brandPromises = [];
    watchBrandsArray.forEach(brand => {
      brandPromises.push(createBrand(knex, brand));
    })
    return Promise.all(brandPromises);
  })
  .catch(error => console.log(`Error seeding data: ${error}`));
};
