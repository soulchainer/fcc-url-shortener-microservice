'use strict';
/* Important to start the appropiate MongoDB database */
process.env.NODE_ENV = 'test';

var chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect;

/* Avoid OverwriteModelError with mocha 'watch' */
var mongoose = require('mongoose');
mongoose.models = {};
mongoose.modelSchemas = {};

var server = require('../app');

chai.use(chaiHttp);

var ShortUrl = require('../app/models/shortUrl');

describe('Url Shortener', function() {
  /* Before anything, drop the collection */
  ShortUrl.collection.drop();
  /* Before every test, save a dummy document in the collection */
  beforeEach(function(done) {
    var newUrl = new ShortUrl({
      original_url : 'https://github.com/soulchainer',
      slug: 'M0l4R'
    }).save(function(err){
      done();
    });
  });
  /* After every test, drop the collection */
  afterEach(function(done) {
    ShortUrl.collection.drop();
    done();
  });

  it('print out the index.html page in / GET', function(done) {
    chai.request(server)
    .get('/')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res).to.be.html;
      done();
    });
  });

  it('shorten and insert in the DB the URL in /new/:originalUrl GET', function(done){
    chai.request(server)
    .get('/new/https://github.com')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res).to.include.keys('body');
      expect(res.body).to.include.all.keys(['original_url', 'short_url']);
      expect(res.body.original_url).to.be.a('string');
      expect(res.body.short_url).to.be.a('string');
      expect(res.body.original_url).to.be.equal('https://github.com');
      done();
    });
  });

  it("don't insert already inserted URL and return the saved one in /new/:originalUrl GET", function(done){
    chai.request(server)
    .get('/new/https://github.com/soulchainer')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res).to.include.keys('body');
      expect(res.body).to.include.all.keys(['original_url', 'short_url']);
      expect(res.body.original_url).to.be.a('string');
      expect(res.body.short_url).to.be.a('string');
      expect(res.body.original_url).to.be.equal('https://github.com/soulchainer');
      var protocol = res.req.agent.protocol,
          host = res.req._headers.host,
          baseUrl = protocol + "//" + host + '/';
      expect(res.body.short_url).to.be.equal(baseUrl + 'M0l4R');
      done();
    });
  });

  it('return JSON error with a non valid URL in /new/:originalUrl GET',
  function(done){
    chai.request(server)
    .get('/new/github.com/soulchainer')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res).to.include.keys('body');
      expect(res.body).to.include.key('error');
      expect(res.body.error).to.be.a('string');
      expect(res.body.error).to.be.equal('Wrong url format, make sure you have a valid protocol and a real site.');
      done();
    });
  });

  it('redirect to saved URL when in /:id with a registered id', function(done){
    chai.request(server)
    .get('/M0l4R')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res).to.redirect;
      expect(res).to.redirectTo('https://github.com/soulchainer');
      done();
    })
  });
  it('return JSON error when a non existent url is requested in /:id GET',
  function(done){
    chai.request(server)
    .get('/M4r10')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res).to.include.keys('body');
      expect(res.body).to.include.key('error');
      expect(res.body.error).to.be.a('string');
      expect(res.body.error).to.be.equal("There's no such URL in the database.");
      done();
    })
  });
});
