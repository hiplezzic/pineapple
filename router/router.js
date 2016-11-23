//-------------------------------------
// /router/router.js
//-------------------------------------

function Router () {

	var fs = require('fs');
	var address = JSON.parse(fs.readFileSync('./router/address.json'));

	this.route = function (app, mysqlConnection, hasher, upload, passport, LocalStrategy, GoogleStrategy, googleAuthInfo) {

		var Home = require('./home');
		var home = new Home(address);
		var homeRouter = home.router;
		var Auth = require('./auth');
		var auth = new Auth(mysqlConnection, hasher, passport, LocalStrategy, GoogleStrategy, address, googleAuthInfo);
		var authRouter = auth.router;
		var Post = require('./post');
		var post = new Post(mysqlConnection, upload, address);
		var postRouter = post.router;
		var Upload = require('./upload');
		var upload = new Upload(mysqlConnection, upload, address);
		var uploadRouter = upload.router;

		app.use('/', homeRouter);
		app.use('/auth', authRouter);
		app.use('/post', postRouter);
		app.use('/upload', uploadRouter);

	}
}

module.exports = Router;
