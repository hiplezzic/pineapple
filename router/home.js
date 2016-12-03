//-------------------------------------
// /router/home.js
//-------------------------------------

function Home (mysqlConnection, ejsPine) {

	var ejsPine = ejsPine;
	
	var express = require('express');
	this.router = express.Router();

	this.router.get('', function(req, res){
		var query = 'SELECT no, videoId, title_pineapple, title_youtube, thumbnails_medium_url FROM youtube';
		mysqlConnection.query(query, function (err, rows, fields) {
			var obj = {
				classes: [],
				contents: rows
			}
			ejsPine.findEjsAddress(req, res, 'home', obj);
		});
		var obj = undefined;
	});
}

module.exports = Home;