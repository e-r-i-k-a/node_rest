const axios = require('axios');
const fs = require('fs');
const util = require('util');
const moment = require('moment');

const stream = fs.createWriteStream(`${__dirname}/log.txt`, {flags: 'a'});
const log = (d) => {
  const now = new Date();
  const date = moment(now).format('MM/DD/YYYY');
  const time = moment(now).format('hh:mm a');
  stream.write(util.format(`${date} @ ${time}: ${d}`) + '\n');
  console.log(util.format(d));
};

const validateState = async (state, country) => {
  if (!state || !country) return false;
  const url = `http://www.groupkt.com/state/get/${country}/${state}`;

  try {
    const response = await axios.get(url);
    const {data} = response;
    const {RestResponse} = data;
    const {result} = RestResponse;

    return result && (result.country === country) && (result.abbr === state);

  } catch(e) {
    console.error(e.message);
    return false;
  }
};

const TEST_VALID_ADDRESS = {
  name: 'Nadim',
  street: '1313 Mockingbird Lane',
  city: 'Mumbai',
  state: 'MH',
  country: 'IND'
};

const TEST_INVALID_ADDRESS = {
  name: 'Devon',
  street: '711 Duane Road',
  city: 'Birmingham',
  state: 'ZA',
  country: 'USA'
};

module.exports = {
  log,
  stream,
  validateState,
  TEST_VALID_ADDRESS,
  TEST_INVALID_ADDRESS
};
