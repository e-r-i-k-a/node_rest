const api = require('express').Router();
const {log, validateState} = require('../utility');
const {Address} = require('../db');
const validSchemaFields = Object.keys(Address.schema.paths);

//GET:
api.get('/', async (req, res) => {
  //return all records on empty route (/), or filter by a valid query (e.g. /?country=IND)
  try {
    let query = {};

    if (req.query) {
      for (key in req.query) {
        value = String(req.query[key]).toUpperCase();
        key = String(key.toLowerCase());

        if (validSchemaFields.indexOf(key) === -1) {
          return res.status(422).json('Invalid query parameter.')
        } else {
          query[key] = value;
        }

      }
    }

    const addresses = await Address.find(query);
    res.status(200).json(addresses);

  } catch(e) {
    log(e.message);
    res.status(500).json('Read failed.');
  }
});

api.get('/:key/:value', async (req, res) => {
  //filter records by valid key:value pair (e.g. /state/IND)
  try {
    const key = String(req.params.key).toLowerCase();
    const value = String(req.params.value).toUpperCase();

    if (validSchemaFields.indexOf(key) === -1) {
      return res.status(400).json('Invalid route.')
    } else {
      const addresses = await Address.find({[key]: [value]});
      res.status(200).json(addresses);
    }

  } catch(e) {
    log(e.message);
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
    log(e.message);
    res.status(500).json('Post failed.');
  }

});

//UPDATE
api.put('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    if (!_id) return res.status(400).json('Null ID.');

    const record = await Address.findById(_id, (e) => {
      if (e) log(e.message);
    });

    if (!record) return res.status(500).json('Record not found.');

    const state = req.body.state || record.state;
    const country = req.body.country || record.country;

    const isValid = state && country ? await validateState(state, country) : true;
    if (!isValid) return res.status(422).json('Invalid state and country combination.')

    await Address.updateOne(record, {$set:{...req.body}}, (e, updated) => {
      if (e) {
        log(e.message);
        return res.status(500).json('Update failed.');
      } else {
        return res.status(200).json(updated.n);
      }
    });

  } catch(e) {
    log(e.message);
    res.status(500).json('Update failed.');
  }
});

//DELETE
api.delete('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const record = await Address.findById(_id, (e) => {
      if (e) log(e.message);
    });

    if (!record) return res.status(500).json('Record not found.')

    await Address.deleteOne(record, (e) => {
      if (e) {
        log(e.message);
        return res.status(500).json('Delete failed.');
      } else {
        return res.sendStatus(204);
      }
    });

  } catch(e) {
    log(e.message);
    res.status(500).json('Delete failed.');
  }
});

module.exports = api;
