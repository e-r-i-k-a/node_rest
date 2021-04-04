const mongoose = require('mongoose');
const mode = process.env.mode || 'dev';
const url = `mongodb://localhost:27017/${mode}`;

const connection = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (e) =>
  console.error(`mongoose connection error: ${e}`)
);
mongoose.connection.on('open', () => console.log('db connected!'));

module.exports = {
  connection,
};
