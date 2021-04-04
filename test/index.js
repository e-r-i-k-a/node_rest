process.env.mode = 'test';
const { expect } = require('chai');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server/start');
const { connection } = require('../db');

const TEST_VALID_ADDRESS = {
  name: 'Nadim',
  street: '1313 Mockingbird Lane',
  city: 'Mumbai',
  state: 'MH',
  country: 'IND',
};
const TEST_INVALID_ADDRESS = {
  name: 'Devon',
  street: '711 Duane Road',
  city: 'Birmingham',
  state: 'ZA',
  country: 'USA',
};

//
//TEST ENV
before('setup the test env', async () => {
  await connection;
});

beforeEach('clear db', async () => {
  await mongoose.connection.db.dropDatabase();
});

after('tear down test env', async () => {
  await mongoose.connection.db.dropDatabase();
  process.env.mode = null;
});

describe('test init', () => {
  it('test1', () => {
    assert.strictEqual('hello world'.length, 11);
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
    await request(app)
      .get('/api')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect((res) => {
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(0);
      })
      .expect(200);
  });
});

describe('GET/api/{key}/{value}', () => {
  it('lists all the stored address records for a given state and country', async () => {
    await request(app).post('/api').send(TEST_VALID_ADDRESS);
    await request(app)
      .get(`/api/country/${TEST_VALID_ADDRESS.country}`)
      .expect((res) => {
        const { body } = res;
        expect(body.length === 1);
        expect(body.country === TEST_VALID_ADDRESS.country);
      });
    await request(app).post('/api').send(TEST_VALID_ADDRESS);
    await request(app)
      .get(`/api/country/${TEST_VALID_ADDRESS.country}`)
      .expect((res) => {
        const { body } = res;
        expect(body.length === 2);
        assert.strictEqual(
          body[0].country,
          body[1].country,
          TEST_VALID_ADDRESS.country
        );
      });
    await request(app)
      .post('/api')
      .send({ ...TEST_VALID_ADDRESS, country: 'another country name' });
    await request(app)
      .get(`/api/country/${TEST_VALID_ADDRESS.country}`)
      .expect((res) => expect(res.body.length === 2));
    await request(app)
      .get(`/api/state/${TEST_VALID_ADDRESS.state}`)
      .expect((res) => {
        const { body } = res;
        expect(body.length === 3);
        assert.strictEqual(body[0].state, TEST_VALID_ADDRESS.state);
      });
  });
});

describe('POST/api', () => {
  it('returns a unique key for each address record', async () => {
    let id1, id2;

    await request(app)
      .post('/api')
      .send(TEST_VALID_ADDRESS)
      .expect(201)
      .expect((res1) => {
        expect((id1 = res1.body));
        expect(typeof id1 === 'String');
      });

    await request(app)
      .post('/api')
      .send(TEST_VALID_ADDRESS)
      .expect(201)
      .expect((res2) => {
        expect((id2 = res2.body));
        expect(typeof id2 === 'String');
      });

    expect(id1).not.to.equal(id2);
  });

  it('only posts valid records', async () => {
    await request(app).post('/api').send(TEST_VALID_ADDRESS).expect(201);
    await request(app).post('/api').send(TEST_VALID_ADDRESS).expect(201);
    await request(app)
      .get('/api')
      .expect((res) => res.body.length === 2);
    await request(app).post('/api').send(TEST_INVALID_ADDRESS).expect(422);
    await request(app)
      .get('/api')
      .expect((res) => res.body.length === 2);
  });

  it('should create an address record containing a name, street, city, and country', async () => {
    await request(app).post('/api').send(TEST_VALID_ADDRESS);
    await request(app)
      .get('/api')
      .expect((res) => {
        const { body } = res;
        expect(body.name === TEST_VALID_ADDRESS.name);
        expect(body.street === TEST_VALID_ADDRESS.street);
        expect(body.city === TEST_VALID_ADDRESS.city);
        expect(body.country === TEST_VALID_ADDRESS.country);
      });
  });

  it('checks that the state is valid for the country - POST', async () => {
    await request(app)
      .post('/api')
      .send(TEST_INVALID_ADDRESS)
      .expect(422)
      .expect((res) =>
        expect(res.error === 'Invalid state and country combination.')
      );
  });
});

describe('PUT/api', () => {
  it('fails with an invalid ID', async () => {
    await request(app)
      .put('/api/fakeId')
      .send(TEST_VALID_ADDRESS)
      .expect(500)
      .expect((res) => expect(res.error === 'Record not found.'));
  });

  it('updates a record', async () => {
    const post = await request(app).post('/api').send(TEST_VALID_ADDRESS);
    const id = JSON.parse(post.res.text);
    await request(app)
      .put(`/api/${id}`)
      .send({ name: 'updated name' })
      .expect(200);
  });

  it('checks that the state is valid for the country - PUT', async () => {
    const post = await request(app).post('/api').send(TEST_VALID_ADDRESS);
    const id = JSON.parse(post.res.text);
    await request(app)
      .put(`/api/${id}`)
      .send({ state: 'AZ' })
      .expect(422)
      .expect((res) =>
        expect(res.error === 'Invalid state and country combination.')
      );
  });
});

describe('DELETE/api', () => {
  it('fails with an invalid ID', async () => {
    await request(app)
      .delete('/api/fakeId')
      .expect(500)
      .expect((res) => expect(res.error === 'Record not found.'));
  });

  it('deletes a record', async () => {
    const post = await request(app).post('/api').send(TEST_VALID_ADDRESS);
    const id = JSON.parse(post.res.text);
    await request(app).delete(`/api/${id}`).expect(204);
  });
});
