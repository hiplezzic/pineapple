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
			res.redirect('http://localhost:81');		
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
		var pj = JSON.parse(req.session.passport.user).pj;
		var nickname = JSON.parse(req.session.passport.user).nickname;
		if (pj) {
			setAccesstokenCookie(nickname, function (nickname, accessToken) {
				updatePjClientYoutubeInfo(nickname, accessToken, function () {

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

			function updatePjClientYoutubeInfo (nickname, accessToken, callback) {

				// id는 같되, etag 다른 자료 추출
				// 다른 자료 update
				// 그중 pj=true인 것들 board 값 update
				var pj = JSON.parse(req.session.passport.user).pj;
				if (pj) {
//console.log('Start!');
					youtubePine.getRefinedYoutubeObj(accessToken, 50, null, function (result) {
						var query = 'SELECT * FROM youtube WHERE nickname=?';
						mysqlConnection.query(query, [nickname], function (err, mysqlResultYoutube, fields) {
console.log(mysqlResultYoutube.length);
							if (err) throw err;
							for (var i = result.length - 1; i >= 0; i--) {
								var resultObj = result[i];
console.log('rslt: '+ i + ' ' + resultObj.title_youtube);
								var flag = false;
								for (var j = mysqlResultYoutube.length - 1; j >= 0; j--) {
									var mysqlResultYoutubeObj = mysqlResultYoutube[j];
console.log('rows: '+ j + ' ' + mysqlResultYoutube.length);
									if (resultObj.id == mysqlResultYoutubeObj.id) {
										flag = true;
										if (resultObj.etag !== mysqlResultYoutubeObj.etag) {
console.log(j +'_ find******')
console.log(resultObj.title_youtube+'/  /'+resultObj.etag)
											// update해야할 항목 발견시
											// update해야할 항목만 추출
											var tempKeyArr = [];
											var tempValueArr = [];
											for (var k = 0; k < Object.keys(resultObj).length; k++) {
												var resultObjKey = Object.keys(resultObj)[k];
												if (String(resultObj[resultObjKey]) !== String(mysqlResultYoutubeObj[resultObjKey])) {
													tempKeyArr.push(resultObjKey);
													tempValueArr.push(resultObj[resultObjKey]);
												}
											}
											mysqlPine.updateValues('youtube', tempKeyArr, tempValueArr, 'id=\''+ resultObj.id +'\'', function () {
											});
											if (mysqlResultYoutubeObj.uploaded) {
												var tempBoardKeyArr = [];
												var tempBoardValueArr = [];
												var boardKeys = [
													'title_youtube', 
													'description_youtube', 
													'privacyStatus_youtube', 
													'thumbnails_standard_url',
													'thumbnails_default_url',
													'thumbnails_medium_url',
													'thumbnails_high_url'
												];
												for (var k = 0; k < boardKeys.length; k++) {
													if (boardKeys[k].split('_youtube').length > 1) {
														var boardKey = boardKeys[k].split('_youtube')[0];
														if ((tempKeyArr.indexOf(boardKeys[k]) !== -1) && !mysqlResultYoutubeObj[boardKey +'_pineapple']) {
															tempBoardKeyArr.push(boardKey);
															tempBoardValueArr.push(tempValueArr[tempKeyArr.indexOf(boardKeys[k])]);
														}
													} else {
														var boardKey = boardKeys[k];
														if (tempKeyArr.indexOf(boardKeys[k]) !== -1) {
															tempBoardKeyArr.push(boardKey);
															tempBoardValueArr.push(tempValueArr[tempKeyArr.indexOf(boardKeys[k])]);
														}
													}
												}
												(function (j) {
													mysqlResultYoutube.splice(j, 1);
													mysqlPine.updateValues('board', tempBoardKeyArr, tempBoardValueArr, 'id=\''+ resultObj.id +'\'', function () {
													});
												})(j)
											} else {
												mysqlResultYoutube.splice(j, 1);
											}
											break;
										} else if (resultObj.etag == mysqlResultYoutubeObj.etag) {
											mysqlResultYoutube.splice(j, 1);
										}
									}
								}
								if (!flag) {
									// insert해야할 항목 발견시
									resultObj['nickname'] = nickname;
									var columnArr = [];
									var valueArr = [];
									for (var k = 0; k < Object.keys(resultObj).length; k++) {
										var key = Object.keys(resultObj)[k];
										columnArr.push(key);
										valueArr.push(resultObj[key]);
									}
									(function (j) {
										mysqlPine.insertValues('youtube', columnArr, valueArr, function () {
console.log('INSERT changes');
										});
									})(j)
								}
							}
							if (mysqlResultYoutube.length) {
								// delete해야할 항목 발견시
								var query = 'DELETE FROM youtube WHERE id=?';
								for (var i = 0; i < mysqlResultYoutube.length; i++) {
									(function (i) {
console.log(mysqlResultYoutube[i]);
										mysqlConnection.query(query, [mysqlResultYoutube[i].id], function (err, rows, field) {
											if (err) throw err;
console.log(i);
											if (mysqlResultYoutube[i].uploaded) {
												var queryBoard = 'DELETE FROM board WHERE id=?';
												mysqlConnection.query(queryBoard, [mysqlResultYoutube[i].id], function (err, rows, fields) {
												});
											}
console.log('DELETE changes');
										});
									})(i)
								}
							}
						});
					});
				}
			}
		}



	});
}

module.exports = Auth;