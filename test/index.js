const {expect} = require('chai');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const {app} = require('../server/start');
const {connection, Address} = require('../db');
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
    await request(app)
    .get('/api')
    .set('Accept', 'application/json')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(res => {
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(0);
    })
    .expect(200);
  });
});

describe('POST/api', () => {
  it('returns a unique key for each address record', async () => {
    let id1, id2;

    await request(app)
    .post('/api')
    .send(VALID_ADDRESS)
    .set('Accept', 'application/json')
    .expect(res1 => {
      id1 = res1.body;
      typeof(id1) === 'String';
    })
    .expect(201);

    await request(app)
    .post('/api')
    .send(VALID_ADDRESS)
    .set('Accept', 'application/json')
    .expect(res2 => {
      id2 = res2.body;
      typeof(id2) === 'String';
    })
    .expect(201);

    expect(id1).not.to.equal(id2);
  });
});

describe('should create an address record', async () => {

  // beforeEach(async () => {
  //   const address = await new Address(VALID_ADDRESS).save();
  // })

  // it ('posts a record', async () => {
  //   const response = await request(app)
  //   .get('/api')
  //   .expect(200);
  //   expect(response.body).to.be.an('array');
  //   expect(response.body.length).to.equal(1);
  // });

  it ('has a name', () => {
    //...
  });
  it ('has a street', () => {
    //...
  });
  it ('has a city', () => {
    //...
  });
  it ('has a state', () => {
    //...
  });
  it ('has a country', () => {
    //...
  });
})

// describe('returns a unique key for each address record', () => {
//   it ('...', () => {
//     //...
//   });
// })

// describe('checks for valid states for the provided country', () => {
//   it ('...', () => {
//     //...
//   });
// })

// describe('updates and deletes individual address records', () => {
//   it ('updates a record', () => {
//     //...
//   });
//   it ('deletes a record', () => {
//     //...
//   });
// })

// describe('lists all the stored address records for a given state and country', () => {
//   it ('...', () => {
//     //...
//   });
// })
