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

module.exports = {
  validateState,
};
