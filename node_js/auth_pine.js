//-------------------------------------
// /node_js/passport_pine.js
//-------------------------------------

function Auth_pine (mysqlConnection, passport, googleAuthInfo, tokenTimer) {

	var request = require('request');
	var querystring = require('querystring');
	var fs = require('fs');
	var googleAuthObj = JSON.parse(fs.readFileSync(googleAuthInfo)).web;

	this.serializeUser = function (mysqlConnection) {
		passport.serializeUser(function(userObj, done) {
			done(null, userObj);
		});

		passport.deserializeUser(function(userObj, done) {
			var query = 'SELECT * FROM accounts WHERE nickname=?';
			var nickname = userObj.nickname;
			mysqlConnection.query(query, [nickname], function (err, rows, fields) {
				if (err) throw err;
				if (!rows.length) {
					done('no setup id yet', false);
				} else {
					return done(null, nickname);
				}
			});
		});
	}

	this.submitLocal = function (mysqlConnection, hasher, LocalStrategy) {
		passport.use(new LocalStrategy(
			function(username, password, done) {
				var query = 'SELECT * FROM accounts WHERE username=?';
				mysqlConnection.query(query, [username], function (err, rows, fields) {
					if (err) {
						throw err;
						done(null, false);
					} else {
						if (!rows.length) {
							done(null, false);
						} else {
							var hasherOpts = {};
							hasherOpts.password = password;
							hasherOpts.salt = rows[0].salt;
							hasher(hasherOpts, function(err, pass, salt, hash) {
								if (rows[0].password === hash) {
									var userObj = {
										client: 'local',
										nickname: rows[0].nickname,
										pj: 'customer'
									}
									done(null, userObj);
								} else {
									done(null, false);
								}
							});
						}
					}
				});
			}
		));
	}

	this.submitGoogle = function (mysqlConnection, hasher, GoogleStrategy) {
		passport.use(new GoogleStrategy(
			{
				clientID: googleAuthObj.client_id,
				clientSecret: googleAuthObj.client_secret,
				callbackURL: googleAuthObj.redirect_uris[0]
			},
			function (accessToken, refreshToken, params, profile, done) {
				var nickname = profile.id + profile.displayName;

				var updateGoogleClientAccountInfo = function (callback) {
					mysqlConnection.query('SELECT pj, nickname FROM accounts WHERE auth_id=\'google:'+ profile.id +'\'', function (err, rowsPjNickname, fields) {
						if (err) throw err;
						var userObj = {
							client: 'google',
							nickname: '',
							pj: 'customer'
						}
						if (!rowsPjNickname.length) {
							var query = 'INSERT INTO accounts (auth_id, username, password, salt, nickname, access_token, expire_at, refresh_token) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )';
							mysqlConnection.query(query, ['google:'+ profile.id, profile.id, 'password', 'salt', profile.id + profile.displayName, accessToken, params.expires_in + Date.now(), refreshToken], function (err, rows, fields) {
								if (err) throw err;
								userObj.nickname = nickname;
								callback(userObj);
							});
						} else {
							var query = 'UPDATE accounts SET access_token=?, expire_at=?, refresh_token=? WHERE auth_id=?';
							mysqlConnection.query(query, [accessToken, params.expires_in + Date.now(), refreshToken, 'google:'+ profile.id], function (err, rows, fields) {
								if (err) throw err;
								userObj.nickname = nickname;
								userObj.pj = rowsPjNickname[0].pj;
								callback(userObj);
							});
						}
					});
				}

				updateGoogleClientAccountInfo(function (result) {
					done(null, result);
				});
			}
		));
	}

	this.setTokenTimer = function (nickname, req, actionName, callback) {
		var normalMode = function (callback) {
			if (Object.keys(tokenTimer).length) {
				callback(null);
			} else {
				var query = 'SELECT expire_at FROM accounts WHERE nickname=?';
				mysqlConnection.query(query, [nickname], function (err, rows, fields) {
					tokenTimer[nickname] = setTimeout(function () {
						getAccesstokenByRefreshToken(nickname, function (accessToken) {
							var query = 'UPDATE accounts SET access_token=? WHERE nickname=?';
							mysqlConnection.query(query, [accessToken, nickname], function (err, rows, fields) {
								if (err) throw err;
							});
						});
					}, rows[0].expire_at - Date.now());
					setInterval(function () {
						var query = 'SELECT a.refresh_token, a.expire_at, a.nickname FROM sessions AS s LEFT JOIN accounts AS a ON json_extract(s.data,  $.passport.user.nickname) = a.nickname';
						mysqlConnection.query(query, function (err, rows, fields) {
							for (var i = 0; i < rows.length; i++) {
								tokenTimer[rows[i].nickname] = setTimeout((function (i) {
									getAccesstokenByRefreshToken(rows[i].refresh_token, function (accessToken) {
										var query = 'UPDATE accounts SET access_token=? WHERE nickname=?';
										mysqlConnection.query(query, [accessToken, rows[i].nickname], function (err, rows, fields) {
											if (err) throw err;
										});
									});
								})(i), rows[i].expire_at - Date.now());
							}
						});
					}, 3540000);
					callback(null);
				});
				
			}
		}
		var eraseMode = function (callback) {
			if (req.session.passport.user.client == 'google') {
				delete tokenTimer[req.session.passport.user.nickname];
				callback(null);
			}
		}

		if (actionName =='normal') {
			normalMode(function () {
				callback(null);
			});
		} else if (actionName =='erase') {
			eraseMode(function () {
				callback(null);
			});
		}

		
		

		function getAccesstokenByRefreshToken (refreshToken, callback) {
			var form = {
			    client_id: googleAuthObj.client_id,
			    client_secret: googleAuthObj.client_secret,
			    refresh_token: refreshToken,
			    grant_type: 'refresh_token'
			};
			var formData = querystring.stringify(form);
			var contentLength = formData.length;
			request({
			    headers: {
			      'Content-Length': contentLength,
			      'Content-Type': 'application/x-www-form-urlencoded'
			    },
			    uri: 'https://www.googleapis.com/oauth2/v4/token',
			    body: formData,
			    method: 'POST'
				}, 
				function (err, res, body) {
					callback(JSON.parse(body).access_token);
			  	}
			);
		}
	}
}

module.exports = Auth_pine;