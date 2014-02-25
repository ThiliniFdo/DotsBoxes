var connect = require('connect');
var config = require('./protected/config');
var crypto = require('crypto');
var Chilly = require('./framework/chilly-0.2');

/**
 * Creates the server
 */
connect()
    //.use(connect.logger({format: ':method :url'}))
    .use(connect.static(__dirname + '/public', { maxAge: config.core.httpStaticCache }))
    .use(connect.cookieParser())
    .use(connect.bodyParser())
	.use(connect.query())
    .use(connect.session({secret: config.core.sessionSecret}))
    .use('/action', Chilly.requestDispatcher)
	.use('/image', function(req, res){
		var today = new Date();
		var timeSalt = (today.getDate() + "_" + today.getMonth());
		res.writeHead(302, {'Location': "http://www.gravatar.com/avatar/" + crypto.createHash('md5').update(req.query.id + timeSalt).digest("hex") + "?s="+req.query.s+"&d=monsterid"});
		res.end();
	  })
    .listen(config.core.port);