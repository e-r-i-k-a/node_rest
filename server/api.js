const api = require('express').Router();
const {Address} = require('../db');
const {validateState} = require('../utility');

//GET:
api.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.query) {
      for (key in req.query) {
        value = String(req.query[key]).toUpperCase();
        key = String(key.toLowerCase());
        query[key] = value;
      }
    }

    const addresses = await Address.find(query);
    res.status(200).json(addresses);

  } catch(e) {
    console.error(e.message);
    res.status(500).json('Read failed.');
  }
});

api.get('/:key/:value', async (req, res) => {
  try {
    const key = String(req.params.key).toLowerCase();
    const value = String(req.params.value).toUpperCase();
    const addresses = await Address.find({[key]: [value]});
    res.status(200).json(addresses);

  } catch(e) {
    console.error(e.message);
    res.status(500).json('Read failed.');
  }
});

//POST
api.post('/', async (req, res) => {
  try {
    const {state, country} = req.body;
    const isValid = state && country ? await validateState(state, country) : true;

    if (!isValid) return res.status(422).json('Invalid state and address combination.')

    const address = await new Address({...req.body}).save();
    res.status(201).json(address['_id']);

  } catch(e) {
    console.error(e.message);
    res.status(500).json('Post failed.');
  }

});

//UPDATE
api.put('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const record = await Address.findById(_id, (e) => {
      if (e) console.error(e.message);
    });

    if (!record) return res.status(500).json('Record not found.');

    const state = req.body.state || record.state;
    const country = req.body.country || record.country;

    const isValid = state && country ? await validateState(state, country) : true;
    if (!isValid) return res.status(422).json('Invalid state and address combination.')

    await Address.updateOne(record, {$set:{...req.body}}, (e, updated) => {
      if (e) {
        console.error(e.message);
        return res.status(500).json('Update failed.');
      } else {
        return res.status(200).json(updated.n);
      }
    });

  } catch(e) {
    console.error(e.message);
    res.status(500).json('Update failed.');
  }
});

//DELETE
api.delete('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const record = await Address.findById(_id, (e) => {
      if (e) console.error(e.message);
    });

    if (!record) return res.status(500).json('Record not found.')

    await Address.deleteOne(record, (e) => {
      if (e) {
        console.error((e || {}).message || '');
        return res.status(500).json('Delete failed.');
      } else {
        return res.sendStatus(204);
      }
    });

  } catch(e) {
    console.error(e.message);
    res.status(500).json('Delete failed.');
  }
});

module.exports = api;
