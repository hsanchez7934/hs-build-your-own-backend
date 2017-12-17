/*eslint-disable */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

require('dotenv').config();

const requireHTTPS = (request, response, next) => {
  if (request.header('x-forwarded-proto') !== 'https') {
    return response.redirect(`https://${request.header('host')}${request.url}`);
  }
  return next();
};

if (process.env.NODE_ENV === 'production') {
  app.use(requireHTTPS);
}

app.set('port', process.env.PORT || 3002);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.locals.title = 'BYOB';

app.set('secretKey', process.env.SECRET_KEY);

const checkAuthorization = (request, response, next) => {
  let token = request.headers.authorization
              || request.body.token
              || request.query.token;

  if (!token) {
    return response.status(403).json(
      { error: `You must be authorized to hit this endpoint`}
    );
  }
  jwt.verify(token, app.get('secretKey'), (error, decoded) => {
    if (error) {
      return response.status(403).json({ error: `Token is invalid ${error}` });
    }
    return decoded.admin === true
      ? next()
      : response.status(403).json({ error: `Need authorization ${error}` });
  });
};

app.post('/api/v1/authenticate', (request, response) => {
  let user;
  let token;
  let verify;
  const { email, appName } = request.body;

  if (!email || !appName) {
    return response.status(422).json(
      { error: `You are missing email, application name, or both.` }
    );
  }

  verify = email.endsWith('@turing.io');
  token = jwt.sign(request.body, process.env.SECRET_KEY);

  if (verify) {
    user = Object.assign({}, request.body, { admin: true, token });
  } else {
    user = Object.assign({}, request.body, { admin: false, token });
  }
  return response.status(201).json({ user });
});

app.get('/api/v1/brands', (request, response) => {
  database('watch_brands').select()
    .then(brands => response.status(200).json(brands))
    .catch(error => response.status(500).json({ error }));
});

app.get('/api/v1/watches', (request, response) => {
  const min = request.param('min');
  const max = request.param('max');

  if (!min || !max) {
    database('watch_models').select()
      .then(watches => response.status(200).json(watches))
      .catch(error => response.status(500).json({ error }));
  }
  if (min && max) {
    database('watch_models').whereBetween('price', [min, max]).select()
      .then(watches => {
        return watches.length
          ? response.status(200).json(watches)
          : response.status(404).json(
            { error: `No watches found in this price range`}
          );
      })
      .catch(error => response.status(500).json({ error }));
  }
});

app.get('/api/v1/brands/:id', (request, response) => {
  database('watch_brands').where('id', request.params.id).select()
    .then(brand => {
      return brand.length
        ? response.status(200).json(brand)
        : response.status(404).json({ error: 'No brand found by this name'});
    })
    .catch(error => response.status(500).json({ error }));
});

app.get('/api/v1/brands/:id/watches', (request, response) => {
  database('watch_models').where('brand_id', request.params.id).select()
    .then(watches => {
      return watches.length
        ? response.status(200).json(watches)
        : response.status(404).json(
          { error: 'No watches found for this brand.'}
        );
    })
    .catch(error => response.status(500).json({ error }));
});

app.get('/api/v1/watches/:id', (request, response) => {
  database('watch_models').where('id', request.params.id).select()
    .then(watch => {
      return watch.length
        ? response.status(200).json(watch)
        : response.status(404).json(
          { error: 'No watches found for this brand.'}
        );
    })
    .catch(error => response.status(500).json({ error }));
});

app.post('/api/v1/brands', checkAuthorization, (request, response) => {
  const body = request.body;
  delete body.token;

  if (!body.brand) {
    return response.status(422).json({ error: 'Missing brand name.' });
  }

  return database('watch_brands').insert(body, '*')
    .then(brandName => response.status(201).json(brandName[0]))
    .catch(error => response.status(500).json({ error }));
});

app.post('/api/v1/brands/:id/watches',
  checkAuthorization,
  (request, response) => {
    let body = request.body;
    const brandID = request.params.id;
    delete body.token;

    for (let requiredParameter of ['model', 'price', 'brand']) {
      if (!body[requiredParameter]) {
        return response.status(422).json(
          { error: `Watch is missing ${requiredParameter} property` }
        );
      }
    }

    body = Object.assign({}, request.body, { brand_id: brandID });

    return database('watch_models').insert(body, '*')
      .then(watch => response.status(201).json(watch[0]))
      .catch(error => response.status(500).json({ error }));
  });

app.patch('/api/v1/brands/:id', (request, response) => {
  const { id } = request.params;
  const brandAlteration = request.body;

  if (!brandAlteration.brand) {
    return response.status(422).json(
      { error: `Must send patch as object
                literal with a key of brand
                and string value.` }
    );
  }
  database('watch_brands').where('id', id)
    .update(brandAlteration, '*')
    .then(update =>
      !update.length
        ? response.sendStatus(404)
        : response.sendStatus(204))
    .catch(error => response.status(500).json(
      { error: `Not successful ${error} ` }
    ));
});

app.patch('/api/v1/watches/:id', (request, response) => {
  const { id } = request.params;
  const watchAlternation = request.body;
  if (!watchAlternation.brand || !watchAlternation.price || !watchAlternation.model) {
    return response.status(422).json(
      { error: `Must send patch as object
                literal with a key of body
                and string value.` });
  }
  database('watch_models').where('id', id)
    .update(watchAlternation, '*')
    .then(update =>
      !update.length
        ? response.sendStatus(404)
        : response.sendStatus(204))
    .catch(error => response.status(500).json(
      { error: `Not successful ${error} ` }
    ));
});

app.delete('/api/v1/brands/:id', checkAuthorization, (request, response) => {
  const { id } = request.params;
  delete request.body.token;

  database('watch_brands').where({ id }).del()
    .then(brand =>
      brand
        ? response.sendStatus(204)
        : response.sendStatus(404).json({ error: `Brand name not found` })
    )
    .catch(error => response.status(500).json({ error }));
});

app.delete('/api/v1/watches/:id', checkAuthorization, (request, response) => {
  const { id } = request.params;
  delete request.body.token;

  database('watch_models').where({ id }).del()
    .then(watch =>
      watch
        ? response.sendStatus(204)
        : response.sendStatus(404).json({ error: `Watch not found` })
    )
    .catch(error => response.status(500).json({ error }));
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;
