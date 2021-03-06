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
		ejsPine.findEjsAddress(req, res, 'youtube', obj);
	});
	this.router.post('/youtube', upload.single('video'), function (req, res, next) {

		var OAuth2 = google.auth.OAuth2;
		var oauth2Client = new OAuth2 (
			'clientid',
			'clientpassword',
			'callback'
		);
		oauth2Client.setCredentials({
			access_token: 'token'
		});

		console.log(req.file);
////파일의 오리지날 경로를 찾는것은 아직 모르겠다.
		//var youtube = google.youtube('v3');
		/*var params = {
			resource: {
				snippet: {
					title: req.body.title,
					description: req.body.description
				},
				status: {
					privacyStatus: "private"    
				}
			},
			part: "snippet,status",
			media: {
				body: 'fs.createReadStream(req.file.video)'
			},
			auth: oauth2Client
        }
        */
/*
		youtube.videos.insert(params, function (err) {
			if (err) throw err;
		});
*/
	});

	this.router.get('/youtube/callback', function (req, res, next) {

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