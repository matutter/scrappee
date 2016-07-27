const hash = require('object-hash')
const request = require('request')
const jquery = require('jquery')
const jsdom = require('jsdom').jsdom

function Client() {
  this.location = null
  this.selectors = null
  this.method = null
}

Client.prototype.select = function(selectors) {
  this.selectors = selectors
  return this
}

Client.prototype.url = function(url) {
  this.location = url
  return this
}

Client.prototype.get = function(url) {
  this.method = request.get
  return this.url(url)
}

Client.prototype.post = function(url) {
  this.method = request.post
  return this.url(url)
}

Client.prototype.then = function(cb) {
  var ref = Object.assign({}, this)
  if(!this.location) throw new TypeError('URL not set')
  if(!cb) throw new TypeError('Callback expected')

  ref.method(ref.location, function (err, res, html) {
    if(err) return cb(err, null)

    if(ref.selectors) {
      var document = jsdom(html, {})
      var window = document.defaultView
      var $ = jquery(window)

      $(document).ready(function() {
        var error = null
        var data = null
        
        try {
          data = object = walk($, ref.selectors)
        } catch(e) {
          error = e
        }

        cb(error, data)
      })

    } else cb(null, html)
  })
  return this
}

function walk($, select) {
  var data = {}
  var keys = Object.keys(select)
  var val = null
  var key = null
  var len = keys.length

  console.log('\tparsing keys', keys)

  for(var i = 0; i < len; i++) {
    key = keys[i]
    val = select[key]
    
    if(typeof val == 'string') {
      data[key] = $(val).text().trim()
    } else if(typeof val == 'function') {
      data[key] = val($, data)
    } else if(typeof val == 'object') {
      data[key] = walk($,val)
    } else {
      throw new TypeError('Unsupported selector value: '+typeof val)
    }

    console.log('\tparsing for key', key)
  }
    
  console.log('\tparsing done')

  return data
}

module.exports.client = function() {
  return new Client()
}

