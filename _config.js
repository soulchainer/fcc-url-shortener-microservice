var config = {};

config.mongoURI = {
  development: 'mongodb://localhost/url-shortener',
  production: process.env.MONGOLAB_URI,
  test: 'mongodb://localhost/test'
};

config.port = {
  development: '8080',
  production: process.env.PORT,
  test: '8081'
};

module.exports = config;
