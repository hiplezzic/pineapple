//-------------------------------------
// /router/upload.js
//-------------------------------------

function Upload (mysqlConnection, upload, ejsPine) {

	var mysqlConnection = mysqlConnection;
	var upload = upload;
	var ejsPine = ejsPine;

	var express = require('express');
	this.router = express.Router();
	var fs = require('fs');
	var google = require('googleapis');

	this.router.get('/youtube', function (req, res, next) {
		ejsPine.findEjsAddress(req, res, 'youtube');
	});
	this.router.post('/youtube', function (req, res, next) {
		var query = 'INSERT INTO youtube (etag, id, videoId, nickname, publishedAt, channelId, playlistId, title_youtube, description, channelTitle, privacyStatus, thumbnails_default_url, thumbnails_default_width, thumbnails_default_height, thumbnails_medium_url, thumbnails_medium_width, thumbnails_medium_height, thumbnails_high_url, thumbnails_high_width, thumbnails_high_height) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		mysqlConnection.query(query, [req.body.etag, req.body.id, req.body.snippet_resourceId_videoId, req.session.passport.user, req.body.snippet_publishedAt, req.body.snippet_channelId, req.body.snippet_playlistId, req.body.snippet_title, req.body.snippet_description, req.body.snippet_channelTitle, req.body.status_privacyStatus, req.body.snippet_thumbnails_default_url, req.body.snippet_thumbnails_default_width, req.body.snippet_thumbnails_default_height, req.body.snippet_thumbnails_medium_url, req.body.snippet_thumbnails_medium_width, req.body.snippet_thumbnails_medium_height, req.body.snippet_thumbnails_high_url, req.body.snippet_thumbnails_high_width, req.body.snippet_thumbnails_high_height], function (err, rows, fields) {
			if (err) throw err;
			res.redirect('/auth/motherboard');
		});
	});

	this.router.get('/test', function (req, res, next) {
		ejsPine.findEjsAddress(req, res, 'uploadtest');
	});
	this.router.post('/test', function (req, res, next) {
		var query = 'INSERT INTO youtube (title, url, uploader) VALUES (\'' + req.body.title +'\',\''+ req.body.url +'\',\''+ req.session.passport.user +'\')';
		mysqlConnection.query(query, function (err, rows, fields) {
			if (err) {
				throw err;
				var obj = {
					classes: ['auth'],
					contents: req.session.passport.user
				}
				ejsPine.findEjsAddress(req, res, 'unknown', obj);
			} else {
				var query = 'SELECT * FROM youtube WHERE title=? AND url=?';
				mysqlConnection.query(query, [req.body.title, req.body.url], function (err, rows, fields) {
					res.redirect('/post/no/' + rows[0]['no']);
				});
			}
		});
	});
}

module.exports = Upload;