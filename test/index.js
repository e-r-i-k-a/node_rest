const {expect} = require('chai');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const {app} = require('../server/start');
const {connection} = require('../db');
const {VALID_ADDRESS, INVALID_ADDRESS} = require('../utility');

//
//TEST ENV
before('setup the test env', async () => {
  process.env.mode = 'test';
  await connection;
});

beforeEach('clear db', async () => {
  mongoose.connection.db.dropDatabase();
});

after('tear down test env', async () => {
  process.env.mode = null;
  mongoose.connection.db.dropDatabase();
});

describe('test init', () => {
  it ('test1', () => {
    assert.equal("hello world".length, 11);
  });
  it('test2', () => {
    var isValid = true;
    expect(isValid).to.be.true;
  });
});
//
//

describe('GET/api', () => {
  it('responds with json', async () => {
    await request(app).get('/api')
    .set('Accept', 'application/json')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(res => {
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(0);
    })
    .expect(200);
  });
});

describe('GET/api/{key}/{value}', () => {
  it('lists all the stored address records for a given state and country', async () => {
    await request(app).post('/api').send(VALID_ADDRESS);
    await request(app).get(`/api/country/${VALID_ADDRESS.country}`)
    .expect(res => {
      const {body} = res;
      expect(body.length === 1);
      expect(body.country === VALID_ADDRESS.country);
    });
    await request(app).post('/api').send({country: VALID_ADDRESS.country});
    await request(app).get(`/api/country/${VALID_ADDRESS.country}`)
    .expect(res => {
      const {body} = res;
      expect(body.length === 2);
      assert.equal(body[0].country, body[1].country, VALID_ADDRESS.country);
    });
    await request(app).post('/api').send({country: 'another country name'});
    await request(app).get(`/api/country/${VALID_ADDRESS.country}`)
    .expect(res => expect(res.body.length === 2));
    await request(app).get(`/api/state/${VALID_ADDRESS.state}`)
    .expect(res => {
      const {body} = res;
      expect(body.length === 1);
      assert.equal(body[0].state, VALID_ADDRESS.state);
    });
  });
});

describe('POST/api', () => {
  it('returns a unique key for each address record', async () => {
    let id1, id2;

    await request(app).post('/api').send(VALID_ADDRESS).expect(201)
    .expect(res1 => {
      expect(id1 = res1.body);
      expect(typeof(id1) === 'String');
    });


    await request(app).post('/api').send(VALID_ADDRESS).expect(201)
    .expect(res2 => {
      expect(id2 = res2.body);
      expect(typeof(id2) === 'String');
    });

    expect(id1).not.to.equal(id2);
  });

  it('only posts valid records', async () => {
    await request(app).post('/api').send(VALID_ADDRESS).expect(201);
    await request(app).post('/api').send(VALID_ADDRESS).expect(201);
    await request(app).get('/api').expect(res => res.body.length === 2);
    await request(app).post('/api').send(INVALID_ADDRESS).expect(422);
    await request(app).get('/api').expect(res => res.body.length === 2)
  });

  it ('should create an address record containing a name, street, city, and country', async () => {
    await request(app).post('/api').send(VALID_ADDRESS);
    await request(app).get('/api')
    .expect(res => {
      const {body} = res;
      expect(body.name === VALID_ADDRESS.name);
      expect(body.street === VALID_ADDRESS.street);
      expect(body.city === VALID_ADDRESS.city);
      expect(body.country === VALID_ADDRESS.country);
    });
  });

  it('checks that the state is valid for the country - POST', async () => {
    await request(app).post('/api').send(INVALID_ADDRESS).expect(422)
    .expect(res => expect(res.error === 'Invalid state and address combination.'));
  });
});

describe('PUT/api', () => {
  it ('fails with an invalid ID', async () => {
    await request(app).put('/api/fakeId').send(VALID_ADDRESS).expect(500)
    .expect(res => expect(res.error === 'Record not found.'));
  });

  it ('updates a record', async () => {
    const post = await request(app).post('/api').send(VALID_ADDRESS);
    const id = JSON.parse(post.res.text);
    await request(app).put(`/api/${id}`).send({name: 'updated name'}).expect(200);
  });

  it ('checks that the state is valid for the country - PUT', async () => {
    const post = await request(app).post('/api').send(VALID_ADDRESS);
    const id = JSON.parse(post.res.text);
    await request(app).put(`/api/${id}`).send({state: 'AZ'}).expect(422)
    .expect(res => expect(res.error === 'Invalid state and address combination.'));
  });
});

describe('DELETE/api', () => {
  it ('fails with an invalid ID', async () => {
    await request(app).delete('/api/fakeId').expect(500)
    .expect(res => expect(res.error === 'Record not found.'));
  });

  it ('deletes a record', async () => {
    const post = await request(app).post('/api').send(VALID_ADDRESS);
    const id = JSON.parse(post.res.text);
    await request(app).delete(`/api/${id}`).expect(204);
  });
});
