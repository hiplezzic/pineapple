//-------------------------------------
// /router/router.js
//-------------------------------------

function Router () {

	var Ejs_pine = require('../node_js/ejs_pine.js');
	var ejsPine = new Ejs_pine;

	this.route = function (app, mysqlConnection, hasher, upload, passport, LocalStrategy, GoogleStrategy, googleAuthInfo) {

		var Home = require('./home');
		var home = new Home(ejsPine);
		var homeRouter = home.router;
		var Auth = require('./auth');
		var auth = new Auth(mysqlConnection, hasher, passport, LocalStrategy, GoogleStrategy, ejsPine, googleAuthInfo);
		var authRouter = auth.router;
		var Post = require('./post');
		var post = new Post(mysqlConnection, upload, ejsPine);
		var postRouter = post.router;
		var Upload = require('./upload');
		var upload = new Upload(mysqlConnection, upload, ejsPine);
		var uploadRouter = upload.router;

		app.use('/', homeRouter);
		app.use('/auth', authRouter);
		app.use('/post', postRouter);
		app.use('/upload', uploadRouter);

	}
}

module.exports = Router;
