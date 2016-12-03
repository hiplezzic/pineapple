//-------------------------------------
// /router/router.js
//-------------------------------------

function Router () {

	this.route = function (app, mysqlConnection, hasher, upload, passport, LocalStrategy, GoogleStrategy, googleAuthInfo, tokenTimer) {

		var Ejs_pine = require('../node_js/ejs_pine.js');
		var ejsPine = new Ejs_pine;
		var Mysql_pine = require('../node_js/Mysql_pine');
		var mysqlPine = new Mysql_pine(mysqlConnection);
		var Auth_pine = require('../node_js/auth_pine.js');
		var authPine = new Auth_pine(mysqlConnection, passport, googleAuthInfo, tokenTimer);
		var Youtube_pine = require('../node_js/youtube_pine.js');
		var youtubePine = new Youtube_pine;

		var Home = require('./home');
		var home = new Home(mysqlConnection, ejsPine);
		var homeRouter = home.router;
		var Auth = require('./auth');
		var auth = new Auth(mysqlConnection, hasher, passport, LocalStrategy, GoogleStrategy, ejsPine, youtubePine, authPine, googleAuthInfo);
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
