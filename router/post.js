//-------------------------------------
// /router/index.js
//-------------------------------------

function Post (mysqlConnection, upload, address) {

	var mysqlConnection = mysqlConnection;
	var address = address;
	var Mysql_pine = require('../node_js/mysql_pine');
	var mysqlPine = new Mysql_pine(mysqlConnection);

	var express = require('express');
	this.router = express.Router();

	this.router.get('/writepost', function (req, res, next) {
		if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
			res.render('./layout', {ejsAddress: address['ejs']['/post/writepost']['auth'], hrefAddress: address['href']});
		} else {
			res.render('./layout', {ejsAddress: address['ejs']['/post/writepost']['unauth'], hrefAddress: address['href'], errStr: '포스트를 작성하시려면, '});
		}
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
		var query = 'SELECT * FROM board WHERE no=?';
		mysqlConnection.query(query, [req.params.no], function (err, rows, fields) {
			var img = '';
			var videourl = '';

			if (JSON.parse(rows[0]['contents'])['img']) {
				img = JSON.parse(rows[0]['contents'])['img'];
			}
			if (JSON.parse(rows[0]['contents'])['videourl']) {
				videourl = JSON.parse(rows[0]['contents'])['videourl'].replace('watch?v=', 'embed/');
			}
			
			if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
				res.render('./layout', {ejsAddress: address['ejs']['/post/no']['auth'], hrefAddress: address['href'], title: rows[0]['title'], img: img, videourl: videourl});
			} else {
				res.render('./layout', {ejsAddress: address['ejs']['/post/no']['unauth'], hrefAddress: address['href'], title: rows[0]['title'], img: img, videourl: videourl});
			}
		});
	});

	this.router.get('/archive', function (req, res, next) {
		var query = 'SELECT * FROM board';
		mysqlConnection.query(query, function (err, rows, fields) {
			if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
				res.render('./layout', {ejsAddress: address['ejs']['/post/archive']['auth'], hrefAddress: address['href'], archive: rows});
			} else {
				res.render('./layout', {ejsAddress: address['ejs']['/post/archive']['unauth'], hrefAddress: address['href'], archive: rows});
			}
		});
	});

	this.router.get('/search', function (req, res, next) {
		var query = 'SELECT * FROM board WHERE title=?';
		mysqlConnection.query(query, [req.query.q], function (err, rows, fields) {
			if (rows.length) {
				if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
					res.render('./layout', {ejsAddress: address['ejs']['/post/search']['auth'], hrefAddress: address['href'], search: rows});
				} else {
					res.render('./layout', {ejsAddress: address['ejs']['/post/search']['unauth'], hrefAddress: address['href'], search: rows});
				}
			} else {
				if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
					res.render('./layout', {ejsAddress: address['ejs']['/error']['auth'], hrefAddress: address['href'], errStr: '일치하는 포스트가 없습니다.'});
				} else {
					res.render('./layout', {ejsAddress: address['ejs']['/error']['unauth'], hrefAddress: address['href'], errStr: '일치하는 포스트가 없습니다.'});
				}	
			}
		});
	});
}

module.exports = Post;