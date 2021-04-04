const axios = require('axios');
const fs = require('fs');
const util = require('util');
const moment = require('moment');

const stream = fs.createWriteStream(`${__dirname}/log.txt`, { flags: 'a' });
const log = (d) => {
  const now = new Date();
  const date = moment(now).format('MM/DD/YYYY');
  const time = moment(now).format('hh:mm a');
  stream.write(util.format(`${date} @ ${time}: ${d}`) + '\n');
  console.log(util.format(d));
};

const getError = (error = {}) => {
  const status = error.name === 'ValidationError' ? 400 : 500;
  const message = error.message || 'Request failed.';
  log(message);
  return { message, status };
};

const validateQuery = (model, query) => {
  const validated = {};
  const validFields = Object.keys(model.schema.paths).filter(
    (k) => k !== '_id' && k !== '__v'
  );

  for (field in query) {
    const key = String(field.toLowerCase());
    const value = String(query[field]).toUpperCase();
    if (!validFields.includes(field)) {
      throw {
        name: 'ValidationError',
        message: `Validation failed: '${field}' is not a valid field.`,
      };
    } else {
      validated[key] = value;
    }
  }
  return validated;
};

const validateState = async ({ country, state }) => {
  if (!state || !country) return false;
  const url = `http://www.groupkt.com/state/get/${country}/${state}`;
  const error = {
    name: 'ValidationError',
    message: 'Invalid state and country combination.',
  };

  try {
    const response = await axios.get(url);
    const { data: { RestResponse: { result } } } = response;

    if (result && result.country === country && result.abbr === state) {
      return true;
    } else {
      throw error;
    }
  } catch (e) {
    throw error;
  }
};

module.exports = {
  getError,
  log,
  stream,
  validateQuery,
  validateState,
};
