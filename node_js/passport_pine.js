//-------------------------------------
// /node_js/passport_pine.js
//-------------------------------------

function Passport_pine (passport, googleAuthObj) {

	var passport = passport;

	this.serializeUser = function (mysqlConnection) {

		passport.serializeUser(function(nickname, done) {
			done(null, nickname);
		});

		passport.deserializeUser(function(nickname, done) {
			var query = 'SELECT * FROM accounts WHERE nickname=?';
			mysqlConnection.query(query, [nickname], function (err, rows, fields) {
				if (err) {
					throw err;
				} else {
					if (!rows.length) {
						//res.render('./layout', {address: includeAddress['/error']['unauth'], errStr: 'Wrong user'});
						done('no setup id yet', false);
					} else {
						return done(null, nickname);
					}
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
						//res.render('./layout', {address: includeAddress['/error']['unauth'], errStr: err});
					} else {
						if (!rows.length) {
							done(null, false);
							//res.render('./layout', {address: includeAddress['/error']['unauth'], errStr: 'Wrong user'});
						} else {
							var hasherOpts = {};
							hasherOpts.password = password;
							hasherOpts.salt = rows[0].salt;
							hasher(hasherOpts, function(err, pass, salt, hash) {
								if (rows[0].password === hash) {
									//req.session.nickname = rows[0].nickname;
									done(null, rows[0].nickname);
								} else {
									done(null, false);
									//res.render('./layout', {address: includeAddress['/error']['unauth'], errStr: 'Wrong password'});
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
				callbackURL: googleAuthObj.redirect_uris[1]
			},
			function(token, tokenSecret, profile, done) {
				mysqlConnection.query('SELECT \'auth_id\' FROM accounts WHERE auth_id=\'google:'+ profile.id +'\'', function (err, rows, fields) {
					if (err) throw err;
					if (!rows.length) {
						mysqlConnection.query('INSERT INTO accounts (auth_id, username, password, salt, nickname) VALUES ( ?, ?, ?, ?, ? )', ['google:'+ profile.id, profile.id, 'password', 'salt', profile.id + profile.displayName], function (err, rows, fields) {
							if (err) throw err;
						});
					}
				});

				done(null, profile.id + profile.displayName);
			}
		));
	};
}

module.exports = Passport_pine;