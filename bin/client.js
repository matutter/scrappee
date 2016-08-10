const hash = require('object-hash')
const request = require('request')
const jquery = require('jquery')
const jsdom = require('jsdom').jsdom

const defaultParams = {
  cached: true
}

function Client(params) {
  this._url = null
  this._selectors = null
  this._method = null
  this._cached = params.cached
  this.cache = {}
}

Client.prototype.cached = function(cached) {
  this._cached = cached
  return this
}

Client.prototype.select = function(selectors) {
  this._selectors = selectors
  return this
}

Client.prototype.url = function(url) {
  this._url = url
  return this
}

Client.prototype.get = function(url) {
  this._method = request.get
  return this.url(url)
}

Client.prototype.post = function(url) {
  this._method = request.post
  return this.url(url)
}

Client.prototype.addCache = function(key, domData) {
  this.cache[key] = domData
}

Client.prototype.getCache = function(key) {
  return this.cache[key] || false
}

Client.prototype.then = function(cb) {
  if(!this._url) throw new TypeError('URL not set')
  if(!cb) throw new TypeError('Callback expected')

  var url = this._url
  var urlHash = hash(url)
  var method = this._method
  var selectors = this._selectors
  var cached = this._cached
  var cache = this.getCache(urlHash)
  
  if(cache) {
    if(selectors) {
      documentReady(cache.document, cache.$, selectors, cb)
    } else {
      cb(null, cache.html)
    }
  } else {
    method(url, (err, res, html) => {
      if(err) return cb(err, null)
      if(selectors) {
        var domData = applySelectors(url, html, selectors, cb)
        if(cached) {
          this.addCache(urlHash, domData)
        }
      } else cb(null, html)
   })
  }

  return this
}

function documentReady(document, $, selectors, cb) {
  $(document).ready(function() {
    var error = null
    var data = null
        
    try {
      data = walk($, selectors)
    } catch(e) {
      error = e
    }

    cb(error, data)
  })
}

function applySelectors(url, html, selectors, cb) {
  var document = jsdom(html, {})
  var window = document.defaultView
  var $ = jquery(window)

  documentReady(document, $, selectors, cb)

  return {
    'url': url,
    '$': $,
    'html': html,
    'window': window,
    'document': document
  }
}

function walk($, select) {
  var data = {}
  var keys = Object.keys(select)
  var val = null
  var key = null
  var len = keys.length

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
  }
    
  return data
}

module.exports.defaultParams = defaultParams
module.exports.client = function(params) {
  return new Client(params || defaultParams)
}

