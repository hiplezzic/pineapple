//-------------------------------------
// /router/upload.js
//-------------------------------------

function Upload (mysqlConnection, upload, address) {

	var mysqlConnection = mysqlConnection;
	var upload = upload;
	var address = address;

	var express = require('express');
	this.router = express.Router();
	var fs = require('fs');
	var google = require('googleapis');

	this.router.get('/youtube', function (req, res, next) {
		res.render('./layout', {ejsAddress: address['ejs']['/upload/youtube']['auth'], hrefAddress: address['href']});
	});
	this.router.post('/youtube', upload.single('video'), function (req, res, next) {

		var OAuth2 = google.auth.OAuth2;
		var oauth2Client = new OAuth2 (
			'199329358753-87p4jsqqc13b26qbmg5t6jt2ivievaes.apps.googleusercontent.com',
			'q7crdYt0EG7OXpROZ6zu9h5G',
			'http://localhost:81/auth/google/callback'
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
}

module.exports = Upload;