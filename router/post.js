//-------------------------------------
// /router/index.js
//-------------------------------------

function Post (mysqlConnection, upload, ejsPine) {

	var mysqlConnection = mysqlConnection;
	var ejsPine = ejsPine;
	var Mysql_pine = require('../node_js/mysql_pine');
	var mysqlPine = new Mysql_pine(mysqlConnection);

	var express = require('express');
	this.router = express.Router();

	this.router.get('/writepost', function (req, res, next) {
		ejsPine.findEjsAddress(req, res, 'writepost');
	});
	this.router.post('/writepost', upload.single('imgfile'), function (req, res, next) {
		var tempObj = {};
		if (req.file.originalname) {
			tempObj['img'] = req.file.originalname;
		}
		if (req.body.videourl) {
			tempObj['videourl'] = req.body.videourl;
		}
		var contents = JSON.stringify(tempObj);

		mysqlPine.insertValues('board', ['title', 'contents'], [req.body.title, contents], function callback() {
			var query = 'SELECT * FROM board WHERE title=?';
			mysqlConnection.query(query, [ req.body.title], function (err, rows, fields) {
				console.log(req.body.title, contents);
				console.log(rows);
				res.redirect('/post/no/' + rows[rows.length-1]['no']);
			});
		});
		/*
		var query = 'INSERT INTO board (title, contents) VALUES (\'' + req.body.title +'\',\''+contents +'\')';;
		mysqlConnection.query(query, function (err, rows, fields) {
			if (err) {
				throw err;
				res.render('./layout', {ejsAddress: address['ejs']['/error']['auth'], hrefAddress: address['href'], errStr: err});
			} else {
				var query = 'SELECT * FROM board WHERE title=? AND contents=?';
				mysqlConnection.query(query, [req.body.title, contents], function (err, rows, fields) {
					res.redirect('/post/no/' + rows[0]['no']);
				});
			}
		});
		*/
	});

	this.router.get('/no/:no', function (req, res, next) {
		var query = 'SELECT * FROM youtube WHERE no=?';
		mysqlConnection.query(query, [req.params.no], function (err, rows, fields) {
			var url = '';
			if (rows[0]['url']) {
				url = rows[0]['url'].replace('watch?v=', 'embed/');
			}

			var obj = {
				classes: [],
				contents: {title: rows[0]['title'], url: url}
			}
			ejsPine.findEjsAddress(req, res, 'postview', obj);
		});
	});

	this.router.get('/archive', function (req, res, next) {
		var query = 'SELECT * FROM youtube';
		mysqlConnection.query(query, function (err, rows, fields) {
			var obj = {
				classes: [],
				contents: rows
			}
			ejsPine.findEjsAddress(req, res, 'archive', obj);
		});
	});

	this.router.get('/search', function (req, res, next) {
		var query = 'SELECT * FROM youtube WHERE title=?';
		mysqlConnection.query(query, [req.query.q], function (err, rows, fields) {
			if (rows.length) {
				var obj = {
					classes: [],
					contents: rows
				}
				ejsPine.findEjsAddress(req, res, 'search', obj);
			} else {
				var obj = {
					classes: [],
					contents: '일치하는 포스트가 없습니다.'
				}
				ejsPine.findEjsAddress(req, res, 'unknown', obj);	
			}
		});
	});
}

module.exports = Post;