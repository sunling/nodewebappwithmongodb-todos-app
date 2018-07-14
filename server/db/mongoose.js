const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//const mongolabUri = 'mongodb://heroku_dzrqmb9b:s6l218d0qq63vb8890155a97ns@ds137581.mlab.com:37581/heroku_dzrqmb9b';

const localUri = 'mongodb://localhost:27017/TodoApp';
mongoose.connect(process.env.MONGODB_URI || localUri);
module.exports = {mongoose};