//-------------------------------------
// /router/home.js
//-------------------------------------

function Home (ejsPine) {

	var ejsPine = ejsPine;
	
	var express = require('express');
	this.router = express.Router();

	this.router.get('', function(req, res){
		var obj = undefined;
		if (req.session.passport && req.session.passport.user) {
			var obj = {
				classes: ['auth'],
				contents: req.session.passport.user
			}
		}
		ejsPine.findEjsAddress(req, res, 'home', obj);
	});
}

module.exports = Home;