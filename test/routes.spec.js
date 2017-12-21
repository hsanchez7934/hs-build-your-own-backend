
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server.js');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile.js')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage with text', () => {
    return chai.request(server).get('/').then(response => {
      response.should.have.status(200);
      response.should.be.html;
    }).catch(error => {
      throw error;
    });
  });

  it(`should return 404 error for nonexistent route`, () => {
    return chai.request(server).get('/nonexistentroute').then(response => {
      response.should.have.status(404);
    }).catch(error => error);
  });
});

describe('API Routes', () => {
  before((done) => {
    database.migrate.latest()
      .then(() => done())
      .catch(error => error);
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => done())
      .catch(error => error);
  });

  it(`should return a token for a user,
      if email ends in turing.io user.admin
      property should be set to true`, (done) => {
      chai.request(server)
        .post(`/api/v1/authenticate`)
        .send({
          "email": "hector@turing.io",
          "appName": "BYOB"
        })
        .then(response => {
          response.should.have.status(201);
          response.body.user.should.have.property('admin');
          response.body.user.should.have.property('token');
          response.body.user.should.have.property('email');
          response.body.user.should.have.property('appName');
          response.body.user.admin.should.equal(true);
          done();
        })
        .catch(error => error);
    });

  it(`should return a token for a user,
      if email does not end in turing.io user.admin
      property should be set to false`, (done) => {
      chai.request(server)
        .post(`/api/v1/authenticate`)
        .send({
          "email": "hector@gmail.com",
          "appName": "BYOB"
        })
        .then(response => {
          response.should.have.status(201);
          response.body.user.should.have.property('admin');
          response.body.user.should.have.property('token');
          response.body.user.should.have.property('email');
          response.body.user.should.have.property('appName');
          response.body.user.admin.should.equal(false);
          done();
        })
        .catch(error => error);
    });

  it(`should retrieve all brands`, () => {
    return chai.request(server)
      .get(`/api/v1/brands`)
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(2);
        response.body[0].brand.should.equal('Jaeger-LeCoultre');
        response.body[1].brand.should.equal('Patek Philippe & Co.');
        response.body[0].id.should.equal(1);
        response.body[1].id.should.equal(2);

        for (var item = 0; item < response.body.length; item++) {
          response.body[item].should.have.property('brand');
          response.body[item].should.have.property('id');
          response.body[item].should.be.a('object');
        }
      })
      .catch(error => error);
  });

  it(`should retrieve all watch models`, () => {
    return chai.request(server)
      .get(`/api/v1/watches`)
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(10);
        response.body[8].model.should.equal('5110P World Time');
        response.body[8].price.should.equal(50000);
        response.body[8].id.should.equal(18);
        response.body[8].brand_id.should.equal(2);
        for (var item = 0; item < response.body.length; item++) {
          response.body[item].should.have.property('brand');
          response.body[item].should.have.property('id');
          response.body[item].should.have.property('price');
          response.body[item].should.have.property('model');
          response.body[item].should.have.property('brand_id');
          response.body[item].should.be.a('object');
        }
      });
  });

  it(`should retrieve all watch models that
           match min and max parameter requirements,
           this test has a min of 0 and max of 3000
           for price range`, () => {
      return chai.request(server)
        .get(`/api/v1/watches?min=0&max=50000`)
        .then(response => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(5);

          for (var item = 0; item < response.body.length; item++) {
            var price = response.body[item].price;

            response.body[item].should.have.property('brand');
            response.body[item].should.have.property('id');
            response.body[item].should.have.property('price');
            response.body[item].should.have.property('model');
            response.body[item].should.have.property('brand_id');
            response.body[item].should.be.a('object');
            expect(price).to.be.below(50001);
          }
        });
    });

  it(`should return status 404 if no watches match
      the min and max parameter requirements,
      for this test the min is 0 and max is 10`, () => {
      return chai.request(server)
        .get(`/api/v1/watches?min=0&max=10`)
        .then(response => {
          response.should.have.status(404);
        })
        .catch(error => error);
    });

  it(`should retrieve specific brand by id number`, () => {
    return chai.request(server)
      .get(`/api/v1/brands/1`)
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(1);
        response.body[0].should.be.a('object');
        response.body[0].id.should.equal(1);
        response.body[0].brand.should.equal('Jaeger-LeCoultre');
      });
  });

  it(`should retrieve specific watch by id number`, () => {
    return chai.request(server)
      .get(`/api/v1/watches/16`)
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(1);
        response.body[0].should.be.a('object');
        response.body[0].id.should.equal(16);
        response.body[0].price.should.equal(87999);
        response.body[0].brand.should.equal('Patek Philippe & Co.');
        response.body[0].brand_id.should.equal(2);
      })
      .catch(error => error);
  });

  it(`should retrieve all watch models by brand, using brand id`, () => {
    return chai.request(server)
      .get(`/api/v1/brands/2/watches`)
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(5);

        for (var item = 0; item < response.body.length; item++) {
          response.body[item].should.be.a('object');
          response.body[item].should.have.property('brand');
          response.body[item].should.have.property('price');
          response.body[item].should.have.property('brand_id');
          response.body[item].should.have.property('model');
          response.body[item].brand.should.equal('Patek Philippe & Co.');
          response.body[item].brand_id.should.equal(2);
        }
      });
  });

  it(`should be able to post a new brand
      to watch_brands database`, (done) => {
      chai.request(server)
        .post(`/api/v1/brands`)
        .send({
          brand: 'Fossil',
          //eslint-disable-next-line
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlY3RvckB0dXJpbmcuaW8iLCJhcHBOYW1lIjoiZ2V0IHdhdGNoZXMiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTEzNDg3MjA4fQ.vXL4HIhCfabw2bcrsQozpNesWB2M6VgNuwObUidk9rA`
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.have.property('brand');
          response.body.brand.should.equal('Fossil');
          done();
        })
        .catch(error => error);
    });

  it.skip(`should not be able to post a new
      brand when user is not authorized`, (done) => {
      chai.request(server)
        .post(`/api/v1/brands`)
        .send({
          brand: 'Fossil',
          token: `sum-key`
        })
        .then(response => {
          response.should.have.status(403);
          done();
        })
        .catch(error => error);
    });

  it(`should be able to post a new watch
      to watch_brands database`, (done) => {
      chai.request(server)
        .post(`/api/v1/brands/1/watches`)
        .send({
          model: `The commuter`,
          price: 175,
          brand: `Patek Philippe & Co.`,
          //eslint-disable-next-line
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlY3RvckB0dXJpbmcuaW8iLCJhcHBOYW1lIjoiZ2V0IHdhdGNoZXMiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTEzNDg3MjA4fQ.vXL4HIhCfabw2bcrsQozpNesWB2M6VgNuwObUidk9rA`
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.have.property('brand');
          response.body.should.have.property('price');
          response.body.should.have.property('brand_id');
          response.body.should.have.property('model');
          response.body.brand.should.equal('Patek Philippe & Co.');
          response.body.price.should.equal(175);
          response.body.brand_id.should.equal(1);
          response.body.model.should.equal('The commuter');
          done();
        })
        .catch(error => error);
    });


  it(`should be able to update an existing brand`, (done) => {
    chai.request(server)
      .patch(`/api/v1/brands/1`)
      .send({
        brand: 'hello'
      })
      .then(response => {
        response.should.have.status(204);
        done();
      });
  });

  it(`should be able to update an existing brand`, (done) => {
    chai.request(server)
      .patch(`/api/v1/watches/10`)
      .send({
        brand: 'hello',
        price: '10',
        model: 'summer'
      })
      .then(response => {
        response.should.have.status(204);
        done();
      });
  });

  it(`should be able to delete brand by id`, () => {
    chai.request(server)
    //eslint-disable-next-line
      .delete(`/api/v1/brands/2?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlY3RvckB0dXJpbmcuaW8iLCJhcHBOYW1lIjoiZ2V0IHdhdGNoZXMiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTEzNDg3MjA4fQ.vXL4HIhCfabw2bcrsQozpNesWB2M6VgNuwObUidk9rA`)
      .then(response => {
        response.should.have.status(204);
      });
  });

  it(`should be able to delete watch by id`, () => {
    chai.request(server)
    //eslint-disable-next-line
      .delete(`/api/v1/watches/10?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhlY3RvckB0dXJpbmcuaW8iLCJhcHBOYW1lIjoiZ2V0IHdhdGNoZXMiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTEzNDg3MjA4fQ.vXL4HIhCfabw2bcrsQozpNesWB2M6VgNuwObUidk9rA`)
      .then(response => {
        response.should.have.status(204);
      });
  });

});
