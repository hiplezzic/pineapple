//-------------------------------------
// /router/home.js
//-------------------------------------

function Home (address) {
	
	var express = require('express');
	this.router = express.Router();

	this.router.get('', function(req, res){
		if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
			res.render('./layout', {ejsAddress: address['ejs']['/']['auth'], hrefAddress: address['href'], user: req.session.passport.user});
		} else {
			res.render('./layout', {ejsAddress: address['ejs']['/']['unauth'], hrefAddress: address['href']});
		}
	});
}

module.exports = Home;