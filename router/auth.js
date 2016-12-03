//-------------------------------------
// /router/auth.js
//-------------------------------------

function Auth (mysqlConnection, hasher, passport, LocalStrategy, GoogleStrategy, ejsPine, youtubePine, authPine, googleAuthInfo) {

	var request = require('request');
	var fs = require('fs');
	var googleAuthObj = JSON.parse(fs.readFileSync(googleAuthInfo)).web;

	var Mysql_pine = require('../node_js/Mysql_pine');
	var mysqlPine = new Mysql_pine(mysqlConnection);

	var express = require('express');
	this.router = express.Router();
	
	authPine.serializeUser(mysqlConnection);

	this.router.get('/register', function (req, res) {
		ejsPine.findEjsAddress(req, res, 'register');
	});
	this.router.post('/register', function (req, res, next) {
		var hasherOpts = {};
		hasherOpts['password'] = result[i].password;
		mysqlConnection.query('SELECT \'no\' FROM accounts WHERE username=\''+ result[i].username +'\' OR nickname=\''+ result[i].nickname + '\'', function(err, rows, fields) {
			if (!rows.length) {
				hasher(hasherOpts, function(err, pass, salt, hash) {
					mysqlPine.insertValues('accounts', ['auth_id', 'username', 'password', 'salt', 'nickname'], ['local:'+ result[i].username , result[i].username, hash, salt, result[i].nickname], function callback() {
						req.login([result[i].nickname], function(err) {
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

	authPine.submitLocal(mysqlConnection, hasher, LocalStrategy);
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

	authPine.submitGoogle(mysqlConnection, hasher, GoogleStrategy);
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
				accessType: "offline", 
				prompt: 'consent'
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
console.log('getPath: callback')
			authPine.setTokenTimer(req.session.passport.user.nickname, req, 'normal', function () {
				res.redirect('http://localhost:81');
			});
		}
	);

	this.router.get('/logout', function (req, res, next) {
		var nickname = req.session.passport.user.nickname;
		authPine.setTokenTimer(nickname, req, 'erase', function () {
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
	});

	this.router.get('/status', function (req, res, next) {
		var query = 'SELECT * FROM accounts WHERE nickname=?';
		var nickname = req.session.passport.user.nickname;
		mysqlConnection.query(query, [nickname], function (err, rows, fields) {
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
		if (result[i].decision == 'true') {
			res.redirect('/auth/logout?withdrawal=1');
		} else {
			res.redirect('/');
		}
	});

	this.router.get('/upgradepj', function (req, res, next) {
		ejsPine.findEjsAddress(req, res, 'upgradepj');
	});
	this.router.post('/upgradepj', function (req, res, next) {
		if (result[i].decision == 'true') {
			var query = 'UPDATE accounts SET pj=? WHERE nickname=?';
			var nickname = req.session.passport.nickname;
			mysqlConnection.query(query, [true, nickname], function (err, rows, fields) {
				if (err) throw err;
				res.redirect('/auth/status');
			});
		}
	});

	this.router.get('/motherboard', function (req, res, next) {
		var pj = req.session.passport.user.pj;
		var nickname = req.session.passport.user.nickname;
		if (pj) {
			setAccesstokenCookie(nickname, function (nickname, accessToken) {
				youtubePine.updatePjClientYoutubeInfo(nickname, accessToken, function () {

				});
			});

			function setAccesstokenCookie (nickname, callback) {
				var query = 'SELECT b.*, a.access_token FROM board AS b LEFT JOIN accounts AS a ON b.nickname = a.nickname WHERE b.nickname=?';
				mysqlConnection.query(query, [nickname], function (err, rows, fields) {
					if (err) throw err;
					var accessToken = rows[0].access_token;
					res.cookie('access_token', accessToken);
					var obj = {
						classes: ['pj'],
						contents: rows
					};
					ejsPine.findEjsAddress(req, res, 'motherboard', obj);
					callback(nickname, accessToken);
				});
			}	
		}
	});
}

module.exports = Auth;