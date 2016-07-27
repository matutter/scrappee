const loggie = GLOBAL.logger = require('loggie')({ level: process.env.LOG_LEVEL || 'info, error, warn'})
const args = require('arg-to-object').parse()

loggie.debug('{{green [ARGS]}}', args)

if(args.get || args.post) {
  var client = require('./bin/client').client()
   
} else {
  loggie.warn('No URL specified; nothing to do.')
}
