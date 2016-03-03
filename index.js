var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ware = require('ware');

module.exports = function(config, eventHandler, optionsTransformer) {

  eventHandler = eventHandler || {};
  eventHandler.logger = eventHandler.logger || function() {};
  eventHandler.stats = eventHandler.stats || function() {};

  optionsTransformer = optionsTransformer || function(req, options, next) { next(null, options); };

  var backendProxyMiddleware = require('./src/middleware/proxy')(config, eventHandler, optionsTransformer);
  var cacheMiddleware = require('reliable-get/CacheMiddleware')(config);
  var selectBackend = require('./src/middleware/backend')(config);
  var rejectUnsupportedMediaType = require('./src/middleware/mediatypes');
  var passThrough = require('./src/middleware/passthrough');
  var interrogateRequest = require('./src/middleware/interrorgator')(config, eventHandler);
  var cleanInvalidUri = require('./src/middleware/invalidurl')(eventHandler);
  var dropFavIcon = require('./src/middleware/favicon');

  var middleware = ware()
                    .use(cleanInvalidUri)
                    .use(dropFavIcon)
                    .use(cacheMiddleware)
                    .use(interrogateRequest)
                    .use(selectBackend)
                    .use(rejectUnsupportedMediaType)
                    .use(passThrough)
                    .use(cookieParser)
                    .use(bodyParser.urlencoded({extended: true}))
                    .use(backendProxyMiddleware);

  return function(req, res) {
    middleware.run(req, res, function(err) {
        if(err) {
            // Just end fast - headers sent above if needed.
            res.end('');
        }
    });
  }

};
