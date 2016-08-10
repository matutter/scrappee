const hash = require('object-hash')
const request = require('request')
const jquery = require('jquery')
const jsdom = require('jsdom').jsdom

const defaultParams = {
  cached: true,
  ttl: 5000 // cache ttl 5 seconds
}

function ClientCache(url, $, doc, client) {
  this.url = url
  this.urlHash = hash(url)
  this.$ = $
  this.document = doc
  this.clientRef = client
  this.ttl = client.cache.ttl
  this.expiresTimeout = null

  return this.hit()
}

// hitting cache extends its TTL
ClientCache.prototype.hit = function() {
  if(this.expiresTimeout)
    clearTimeout(this.expiresTimeout)

  this.expiresTimeout = setTimeout(() => {
    delete this.clientRef.cache.data[this.urlHash]
    this.clientRef.cache.data[this.urlHash] = null
  }, this.ttl);

  // ensure cache exists
  this.clientRef.addCache(this)
}

function Client(params) {
  this._url = null
  this._selectors = null
  this._method = null
  this._cached = params.cached
  this.cache = {
    ttl: params.ttl,
    data: {} // map of urls to ClientCache
  }
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

Client.prototype.setTTL = function(ttl) {
  this.cache.ttl = ttl
  return this
}

Client.prototype.addCache = function(cache) {
  this.cache.data[cache.urlHash] = cache
}

Client.prototype.getCache = function(url) {
  return this.cache.data[hash(url)]
}

Client.prototype.then = function(cb) {
  if(!this._url) throw new TypeError('URL not set')
  if(!cb) throw new TypeError('Callback expected')

  var url = this._url
  var method = this._method
  var selectors = this._selectors
  var cached = this._cached
  var cache = this.getCache(url)
  
  if(cache) {
    if(selectors) {
      documentReady(cache.document, cache.$, selectors, cb)
      cache.hit() // reset expiration
    } else {     
     cb(new TypeError('Caching for raw HTML not supported'), null)
    }
  } else {
    method(url, (err, res, html) => {
      if(err) return cb(err, null)
      if(selectors) {
        cache = applySelectors(url, html, selectors, this, cb)
        if(cached) {
          this.addCache(cache)
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

function applySelectors(url, html, selectors, client, cb) {
  var document = jsdom(html, {})
  var window = document.defaultView
  var $ = jquery(window)

  documentReady(document, $, selectors, cb)

  return new ClientCache(url, $, document, client)
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

