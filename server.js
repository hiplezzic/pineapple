//-------------------------------------
// /server.js
//-------------------------------------

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mysqlStore = require('express-mysql-session')(session);
var mysql = require('mysql');
var pbkdf2Password = require('pbkdf2-password');
var multer = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function start (router) {
	var app = express();
	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './public/img');
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname);
		}
	});
	var upload = multer({ storage: storage });

	var mysqlUser = '';
	var mysqlPassword = '';
	var mysqlDatabase = '';
	mysqlUser = process.argv[2];
	mysqlPassword = process.argv[3];
	mysqlDatabase = process.argv[4];
	var mysqlConnection = mysql.createConnection({
		host	 : 'localhost',
		user	 : mysqlUser,
		password : mysqlPassword,
		database : mysqlDatabase 
	});
	mysqlConnection.connect();
	if (mysqlConnection.config.user) {
		console.log('Successed to Connected to MYSQL, '+ mysqlConnection.config.user);
	}

	var hasher = pbkdf2Password();

	app.locals.pretty = true;
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.use(cookieParser());
	app.use(session({
		secret: '$!@&(#@*SDF*(#$@#',
		store: new mysqlStore({
			host: 'localhost',
		    user: mysqlUser,
		    password: mysqlPassword,
		    database: mysqlDatabase
		}),
		resave: false,
		saveUninitialized: true
	}))

	var googleAuthInfo = '';
	googleAuthInfo = process.argv[5];
	app.use(passport.initialize());
	app.use(passport.session());

	router.route(app, mysqlConnection, hasher, upload, passport, LocalStrategy, GoogleStrategy, googleAuthInfo);

	var server = app.listen(81, function(){
		console.log("Express server has started on port 81");
	});
}

exports.start = start;