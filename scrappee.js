const hash = require('object-hash')
const request = require('request')
const cheerio = require('cheerio')
const path = require('path')

function Selector(selector, key, ordinal) {
	this.selector = selector
	this.key = key
	this.ordinal = ordinal
}

function Query(url, selector) {
	this.url = url
	this.selector = selector
	this.hash = {
		request: hash([url, selector]),
		response: ''
	}
}

function scrape(params) {
	var urls = params.urls || [params.url]
	var select = params.selectors
	var parser = params.parser

	if(!Array.isArray(urls)) throw new Error('Malformed urls provided')

	console.log('Scrappee is running')
	
	urls.forEach( url => request(url, function(e, res, html){
		if(e) return console.log(e)

		var data = {}
		var $ = cheerio.load(html);

		select.forEach( selector => {

			var query = new Query(url, selector)
			var text = $(selector.selector).text()
			var key = selector.key || selector.ordinal
			data[key] = parser[key] ? parser[key](text) : text


		})

		console.log(data)
	}))
}

if(~process.argv.join(' ').indexOf('scrappee')) {
	var cmd = {
		url: ['-url', '-u'],
		url_seq : ['-url-sequence', '-url-seq', '-us'],
		selectors: ['-s', '-sel', '-select', '-selectors'],
		parse_module: ['-parse-module', '-parse-mod', '-pm']
	}
	var argv = process.argv
	var argc = argv.length

	var skip = 0
	var params = {
		url: '',
		urls: [],
		url_seq: [],
		selectors: [],
		parser: {}
	}

	const split = (ary, val, replace, split) => {
		val = val.replace(replace, '').split(split)
		val = val.filter(v => v.length)
		val.forEach(seq => ary.push(seq.trim()))
	}

	argv.forEach((val, i, argv) => {
		
		if(skip) return skip--

		if(~cmd.url.indexOf(val)) {
			skip = 1
			params.url = argv[i+1]
		} else if(~cmd.url_seq.indexOf(val)) {
			split(params.url_seq, argv[i+1], /\[|\]/g, /[,\s+]/g)
			skip = 1
		} else if(~cmd.selectors.indexOf(val)) {
			split(params.selectors, argv[i+1], /\[|\]/g, /,\s+?/g)
			var ordinal = 0
			params.selectors = params.selectors.map(sel => {
				var match
				if(match = /^\$(\w+)\=(.*)/.exec(sel)) {
					var key = match[1]
					var selector = match[2]
					sel = new Selector(selector, key, false)
				} else {
					sel = new Selector(sel, false, ordinal++)
				}
				return sel
			})
			skip = 1
		} else if(~cmd.parse_module.indexOf(val)) {
			val = argv[i+1]
			params.parser = require(path.resolve(val))
		}
	})

	if(~params.url.indexOf('{}')) {
		params.url_seq.forEach(token => {
			params.urls.push(
				params.url.replace('{}', token)
			)
		})		
	}

	scrape(params)
}
