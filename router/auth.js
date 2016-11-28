//-------------------------------------
// /router/auth.js
//-------------------------------------

function Auth (mysqlConnection, hasher, passport, LocalStrategy, GoogleStrategy, ejsPine, youtubePine, googleAuthInfo) {

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
			var nickname = JSON.parse(req.session.passport.user).nickname;
			mysqlConnection.query(query, [nickname], function (err, rows, fields) {
				var accessToken = rows[0].access_token;
				if (rows.length) {
					if (JSON.parse(req.session.passport.user).pj) {
console.log('Start!');
						youtubePine.getRefinedYoutubeObj(accessToken, 50, null, function (result) {
							var query = 'SELECT * FROM youtube';
							mysqlConnection.query(query, function (err, rows, fields) {
								for (var i = 0; i < result.length; i++) {
									var flag = false;
									for (var j = 0; j < rows.length; j++) {
										if (result[i].id == rows[j].id) {
											flag = true;	
											if (result[i].etag !== rows[j].etag) {
console.log(result[i].etag +' '+ rows[j].etag);
console.log('Found!');	
												for (var k = 0; k < Object.keys(result[i]).length; k++) {
													var key = Object.keys(result[i])[k];
													// var query = 'UPDATE youtube SET ?=? WHERE ?=?';
													// mysqlConnection.query(query, [key, result[i][key], 'id', result[i].id], function (err, rows, fields) {
													// 	if(err) throw err;
													// });	
													mysqlPine.updateValues('youtube', [key], [result[i][key]], 'id=\''+ result[i].id +'\'', function () {

													});
												}
												/*var query = 'UPDATE youtube SET thumbnails_default_url=?, thumbnails_default_width=?, thumbnails_default_height=?, thumbnails_medium_url=?, thumbnails_medium_width=?, thumbnails_medium_height=?, thumbnails_high_url=?, thumbnails_high_width=?, thumbnails_high_height=?, thumbnails_standard_url=?, thumbnails_standard_width=?, thumbnails_standard_height=? WHERE id=?';
												mysqlConnection.query(query, [result[i].thumbnails_default_url, result[i].thumbnails_default_width, result[i].thumbnails_default_height, result[i].thumbnails_medium_url, result[i].thumbnails_medium_width, result[i].thumbnails_medium_height, result[i].thumbnails_high_url, result[i].thumbnails_high_width, result[i].thumbnails_high_height, result[i].thumbnails_standard_url, result[i].thumbnails_standard_width, result[i].thumbnails_standard_height, result[i].id], function (err, rows, fields) {

												});*/
											}
										}
									}
									if (!flag) {
										result[i]['nickname'] = nickname;
										var columnArr = [];
										var valueArr = [];
										for (var k = 0; k < Object.keys(result[i]).length; k++) {
											var key = Object.keys(result[i])[k];
											columnArr.push(key);
											valueArr.push(result[i][key]);
										}
										mysqlPine.insertValues('youtube', columnArr, valueArr, function () {

										});
									}
								}

								/*
								if (!flag) {
									var query = 'INSERT INTO youtube (etag, id, videoId, nickname, publishedAt, channelId, playlistId, title_youtube, description, channelTitle, privacyStatus, thumbnails_default_url, thumbnails_default_width, thumbnails_default_height, thumbnails_medium_url, thumbnails_medium_width, thumbnails_medium_height, thumbnails_high_url, thumbnails_high_width, thumbnails_high_height, thumbnails_standard_url, thumbnails_standard_width, thumbnails_standard_height) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
									mysqlConnection.query(query, [result[i].etag, result[i].id, result[i].videoId, nickname, result[i].publishedAt, result[i].channelId, result[i].playlistId, result[i].title_youtube, result[i].description, result[i].channelTitle, result[i].privacyStatus, result[i].thumbnails_default_url, result[i].thumbnails_default_width, result[i].thumbnails_default_height, result[i].thumbnails_medium_url, result[i].thumbnails_medium_width, result[i].thumbnails_medium_height, result[i].thumbnails_high_url, result[i].thumbnails_high_width, result[i].thumbnails_high_height, result[i].thumbnails_standard_url, result[i].thumbnails_standard_width, result[i].thumbnails_standard_height], function (err, rows, fields) {

									});
								}*/
							});
						});
						res.cookie('access_token', accessToken);
						res.redirect('http://localhost:81');
					}
				} else {
					res.redirect('http://localhost:81');
				}
			});
		}
	);

	this.router.get('/logout', function (req, res, next) {
		var nickname = JSON.parse(req.session.passport.user).nickname;
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
		var nickname = JSON.parse(req.session.passport.user).nickname;
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
			var nickname = JSON.parse(req.session.passport).nickname;
			mysqlConnection.query(query, [true, nickname], function (err, rows, fields) {
				if (err) throw err;
				res.redirect('/auth/status');
			});
		}
	});

	this.router.get('/motherboard', function (req, res, next) {
		ejsPine.findEjsAddress(req, res, 'motherboard');
	});
}

module.exports = Auth;