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
		// if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
		// 	res.render('./layout', {ejsAddress: address['ejs']['/']['auth'], hrefAddress: address['href'], user: req.session.passport.user});
		// } else {
		// 	res.render('./layout', {ejsAddress: address['ejs']['/']['unauth'], hrefAddress: address['href']});
		// }
	});
}

module.exports = Home;