var client = require('..').client()
var assert = require('chai').assert

var selectors1 = {
  username: ".vcard-username"
}

var selectors2 = {
  name: 'strong[itemprop="name"] a',
  details: function($, data) {
    try {
      var e = $('ul.numbers-summary .num.text-emphasized')
      var d = {
        commit: null,
        branch: null,
        release: null
      }
      if(e.length >= 3) {
        d.commit = $(e[0]).clone().children().remove().end().text().trim()
        d.branch = $(e[1]).clone().children().remove().end().text().trim()
        d.release = $(e[2]).clone().children().remove().end().text().trim()
      }
      return d
    } catch(e) {
      return e
    }
  }
}

describe('GET from github.com/matutter', function() {
  this.timeout(10000)
  describe('Selecting .vcard-username', function() {
    it('should create the object { username: "matutter"}', function(done) {
      var expected = { username: 'matutter' }
      client
        .get("https://github.com/matutter")
        .select(selectors1)
        .then((e, data) => {
          assert.equal(e, null) // no error
          assert.deepEqual(data, expected)
          done()          
        })
    })
  })
  describe('Selecting nested data with a function selector', function() {
    it('should produce {name:..., details: {}}', function(done) {
      client
        .url('https://github.com/matutter/scrappee')
        .select(selectors2)
        .then((err, data) => {
          assert.equal(err, null)
          assert.equal(data.name, 'scrappee')
          done()
        })
    })
  })

  describe('When a bad uri is provided', function() {
    it('should return an error and data will be null', function(done) {
      client
        .get('www')
        .select( { key: ()=>{throw new Error('my error')} })
        .then(function(err, data) {
          assert.equal(data, null)
          assert.equal(err.message, 'Invalid URI "www"')
          done()
        })
    })
  })

  //http://www.purple.com/purple.html
  describe('When an error is thrown in a function handler', function() {
    it('should return a value on err argument and data will be null', function(done) {
      client
        .get('http://www.purple.com/purple.html')
        .select( { key: ()=>{throw new Error('my error')} })
        .then(function(err, data) {
          assert.equal(data, null)
          assert.equal(err.message, 'my error')
          done()
        })
    })
  })

  //http://www.purple.com/purple.html

})
