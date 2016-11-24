//-------------------------------------
// /router/home.js
//-------------------------------------

function Home (mysqlConnection, ejsPine) {

	var ejsPine = ejsPine;
	
	var express = require('express');
	this.router = express.Router();

	this.router.get('', function(req, res){
		var query = 'SELECT * FROM youtube';
		mysqlConnection.query(query, function (err, rows, fields) {
			var obj = {
				classes: [],
				contents: rows
			}
			ejsPine.findEjsAddress(req, res, 'home', obj);
		});
		var obj = undefined;
		/* 로그인할 경우 닉네임 표시
		if (req.session.passport && req.session.passport.user) {
			var obj = {
				classes: ['auth'],
				contents: req.session.passport.user
			}
		}
		ejsPine.findEjsAddress(req, res, 'home', obj);
		*/
	});
}

module.exports = Home;