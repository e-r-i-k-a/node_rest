const api = require('express').Router();
const { getError, log, validateQuery, validateState } = require('../utility');
const { Address } = require('../db/schemas');

//GET:
api.get('/', async (req, res) => {
  //return all records on empty route (/), or filter by a valid query (e.g. /?country=IND)
  let query = {};
  try {
    if (req.query) query = validateQuery(Address, req.query);

    const addresses = await Address.find(query);
    return res.status(200).json(addresses);
  } catch (e) {
    const { message, status } = getError(e);
    return res.status(status).json(message);
  }
});

api.get('/:key/:value', async (req, res) => {
  //filter records by valid key:value pair (e.g. /country/IND)
  const { key, value } = req.params;
  try {
    const query = validateQuery(Address, { [key]: [value] });
    const addresses = await Address.find({ ...query });
    return res.status(200).json(addresses);
  } catch (e) {
    const { message, status } = getError(e);
    return res.status(status).json(message);
  }
});

//POST
api.post('/', async (req, res) => {
  try {
    const { state, country } = req.body;
    const isValid =
      state && country ? await validateState({ country, state }) : true;

    if (!isValid)
      return res.status(422).json('Invalid state and address combination.');

    const model = await new Address({ ...req.body }).save();
    return res.status(201).json(model['_id']);
  } catch (e) {
    const { message, status } = getError(e);
    return res.status(status).json(message);
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

    const isValid =
      state && country ? await validateState({ country, state }) : true;
    if (!isValid)
      return res.status(422).json('Invalid state and country combination.');

    await Address.updateOne(record, { $set: { ...req.body } }, (e, updated) => {
      if (e) {
        const { message, status } = getError(e);
        return res.status(status).json(message);
      } else {
        return res.status(200).json(updated.n);
      }
    });
  } catch (e) {
    const { message, status } = getError(e);
    return res.status(status).json(message);
  }
});

//DELETE
api.delete('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const record = await Address.findById(_id, (e) => {
      if (e) log(e.message);
    });

    if (!record) return res.status(404).json('Record not found.');

    await Address.deleteOne(record, (e) => {
      if (e) {
        const { message, status } = getError(e);
        return res.status(status).json(message);
      } else {
        return res.sendStatus(204);
      }
    });
  } catch (e) {
    const { message, status } = getError(e);
    return res.status(status).json(message);
  }
});

module.exports = api;
