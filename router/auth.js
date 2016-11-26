//-------------------------------------
// /router/auth.js
//-------------------------------------

function Auth (mysqlConnection, hasher, passport, LocalStrategy, GoogleStrategy, ejsPine, googleAuthInfo) {

	var request = require('request');
	var fs = require('fs');
	var googleAuthObj = JSON.parse(fs.readFileSync(googleAuthInfo)).web;

	var Mysql_pine = require('../node_js/Mysql_pine');
	var mysqlPine = new Mysql_pine(mysqlConnection);
	var Passport_pine = require('../node_js/passport_pine');
	var passportPine = new Passport_pine(passport, googleAuthObj);

	var express = require('express');
	this.router = express.Router();
	
	passportPine.serializeUser(mysqlConnection);

	this.router.get('/register', function (req, res) {
		ejsPine.findEjsAddress(req, res, 'register');
	});
	this.router.post('/register', function (req, res, next) {
		var hasherOpts = {};
		hasherOpts['password'] = req.body.password;
		mysqlConnection.query('SELECT \'no\' FROM accounts WHERE username=\''+ req.body.username +'\' OR nickname=\''+ req.body.nickname + '\'', function(err, rows, fields) {
			if (!rows.length) {
				hasher(hasherOpts, function(err, pass, salt, hash) {
					mysqlPine.insertValues('accounts', ['auth_id', 'username', 'password', 'salt', 'nickname'], ['local:'+ req.body.username , req.body.username, hash, salt, req.body.nickname], function callback() {
						req.login([req.body.nickname], function(err) {
							req.session.save(function() {
								res.redirect('/');
							});
						});
					});
				});
			} else {
				var obj = {
					classes: ['auth'],
					contents: '이미 해당 아이디 혹은 닉네임이 존재합니다.'
				}
				ejsPine.findEjsAddress(req, res, 'unknown', obj);
			}
		});
	});

	passportPine.submitLocal(mysqlConnection, hasher, LocalStrategy);
	this.router.get('/login', function(req, res, next) {
		ejsPine.findEjsAddress(req, res, 'login');
	});
	this.router.post(
		'/login', 
		passport.authenticate(
			'local', 
			{ 
				successRedirect: '/',
				failureRedirect: '/login',
				failureFlash: false
			}
		)
	);

	passportPine.submitGoogle(mysqlConnection, hasher, GoogleStrategy);
	this.router.get(
		'/google',
		passport.authenticate(
			'google',
			{
				/*access_type: "offline",
				client_id: googleAuthObj.client_id,
				client_secret: googleAuthObj.secret,
				project_id: googleAuthObj.project_id,
				auth_uri: googleAuthObj.auth_uri,
				token_uri: googleAuthObj.token_uri,
				auth_provider_x509_cert_url: googleAuthObj.auth_provider_x509_cert_url,
				redirect_uris: googleAuthObj.redirect_uris,
				javascript_origins: googleAuthObj.javascript_origins*/
				scope: 
					[
						"https://www.googleapis.com/auth/youtube",
						"https://www.googleapis.com/auth/youtube.force-ssl",
						"https://www.googleapis.com/auth/youtube.readonly",
						"https://www.googleapis.com/auth/youtube.upload",
						"https://www.googleapis.com/auth/youtubepartner",
						"https://www.googleapis.com/auth/youtubepartner-channel-audit",
						'https://www.googleapis.com/auth/plus.login'
					],
				
			}
		)
	);
	this.router.get(
		'/google/callback', 
		passport.authenticate(
			'google',
			{ failureRedirect: 'http://localhost:81/auth/login' }
		),
		function(req, res) {
			var query = 'SELECT access_token FROM accounts WHERE nickname=?';
			mysqlConnection.query(query, [req.session.passport.user], function (err, rows, fields) {
				if (rows.length) {
					res.cookie('access_token', rows[0].access_token);
					res.redirect('http://localhost:81');
				} else {
					res.redirect('http://localhost:81');
				}
			});
		}
	);

	this.router.get('/logout', function (req, res, next) {
		var nickname = req.session.passport.user;

		req.logout();
		if (req.query.withdrawal) {
			mysqlConnection.query('DELETE FROM accounts WHERE nickname=\''+ nickname +'\'', function (err, rows, fields) {
				if (err) throw err;
			});
		}
		req.session.save(function() {
			res.redirect('/');
		});
	});

	this.router.get('/status', function (req, res, next) {
		var query = 'SELECT * FROM accounts WHERE nickname=?';
		mysqlConnection.query(query, [req.session.passport.user], function (err, rows, fields) {
			var obj = {
				classes: ['auth'],
				contents: rows
			}
			ejsPine.findEjsAddress(req, res, 'status', obj);
		});
	});

	this.router.get('/withdrawal', function (req, res, next) {
		ejsPine.findEjsAddress(req, res, 'withdrawal');
	});
	this.router.post('/withdrawal', function (req, res, next) {
		if (req.body.decision == 'true') {
			res.redirect('/auth/logout?withdrawal=1');
		} else {
			res.redirect('/');
		}
	});

	this.router.get('/upgradepj', function (req, res, next) {
		ejsPine.findEjsAddress(req, res, 'upgradepj');
	});
	this.router.post('/upgradepj', function (req, res, next) {
		if (req.body.decision == 'true') {
			var query = 'UPDATE accounts SET pj=? WHERE nickname=?';
			mysqlConnection.query(query, [true, req.session.passport.user], function (err, rows, fields) {
				if (err) throw err;
				res.redirect('/auth/status');
			});
		}
	});

	this.router.get('/motherboard', function (req, res, next) {
		//SELECT \'access_token\' ~ 이라고 query 작성시 {access_token: 'access_token'}이라고 뜬다
		var query = 'SELECT * FROM accounts WHERE nickname=?';
		mysqlConnection.query(query, [req.session.passport.user], function (err, rows, fields) {
// console.log(rows);
			var accessToken = rows[0].access_token;
			ejsPine.findEjsAddress(req, res, 'motherboard');
		});
	});
}

module.exports = Auth;