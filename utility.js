const axios = require('axios');

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

const VALID_ADDRESS = {
  name: 'Nadim',
  street: '1313 Mockingbird Lane',
  city: 'Mumbai',
  state: 'MH',
  country: 'IND'
};

const INVALID_ADDRESS = {
  name: 'Devon',
  street: '711 Duane Road',
  city: 'Birmingham',
  state: 'ZA',
  country: 'USA'
};

module.exports = {
  validateState,
  VALID_ADDRESS,
  INVALID_ADDRESS
};
