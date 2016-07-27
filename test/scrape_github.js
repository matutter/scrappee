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
          console.log('\ttest 1 returned', data)
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
          console.log('\ttest 2 returned', data)
          assert.equal(err, null)
          assert.equal(data.name, 'scrappee')
          done()
        })
    })
  })
})
