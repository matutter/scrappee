var client = require('..').client()
var assert = require('chai').assert
var url = 'https://github.com/matutter'

describe('GET from '+url, function() {

  describe('scraping for nested structures', function() {
    it('should populate a complex object', function(done) {
      client
      .get(url)
      .select({
        names : {
          fullname : '.vcard-fullname',
          username : '.vcard-username'
        }
      }).then((e,data) => {
        var expected = {
          names : {
            fullname : 'Mat Utter',
            username : 'matutter'
          }
        }
        assert.equal(e, null)
        assert.deepEqual(data, expected)
        done()
      })
    })
  })

})
