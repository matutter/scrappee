var client = require('..').client()
var assert = require('chai').assert

var selectors1 = {
  username: ".vcard-username"
}

var selectors2 = {
  email: '.vcard-detail[aria-label="Email"] a'
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
  describe('(CACHED) Selecting '+selectors2.email, function(){
    it('should retrieve matutter4@gmail.com from cache', function(done) {
      client.select(selectors2)
      .then((e,data) => {
        assert(data.email, 'matutter4@gmail.com')
        done()
      })
    })
  })

})
