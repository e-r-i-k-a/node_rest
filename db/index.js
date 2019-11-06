const mongoose = require('mongoose');
const mode = process.env.mode || 'dev';
const url = `mongodb://localhost:27017/${mode}`;


const addressSchema = new mongoose.Schema({
  name: String,
  street: String,
  city: String,
  state: String,
  country: String,
});

const Address = mongoose.model('Address', addressSchema);
const connection = mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('error', () => console.error('mongoose.connection error:'));
mongoose.connection.on('open', () => console.log('db connected!'));

module.exports = {
  Address,
  connection,
}
