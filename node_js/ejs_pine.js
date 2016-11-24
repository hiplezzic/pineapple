//-------------------------------------
// /node_js/ejs_pine.js
//-------------------------------------

function Ejs_pine () {

	var fs = require('fs');
	var async = require('async');

	var address = {
		path: {
			home: 		'/',
			register: 		'/auth/register',
			login_local: 	'/auth/login',
			login_google: 	'/auth/google',
			logout: 		'/auth/logout',
			withdrawal: 	'/auth/withdrawal',
			//write_post: '/post/writepost',
			write_post: '/upload/test',
			search: 	'/post/search',
			archive: 	'/post/archive',
			post: 		'/post/no/',
			upload: 	'/upload/youtube'
		},
		img: {
			favorite: '/img/favorite.png',
			favorite_selected: '/img/favorite_selected.png',
			login_status: '/img/login_status.png',
			logoff_status: '/img/logoff_status.png',
			menubar: '/img/menubar.png',
			sajiyo: '/img/sajiyo.jpg',
			search: '/img/search.png',
			sgy: '/img/sgy.jpg',
			upload: '/img/upload.png'
		}
	}
	var ejsListArr = [];

	makeEjsListArr();

	this.findEjsAddress = function (req, res, path, obj) {	
		var avatar = {
			auth: 'unauth'
		}
		var tagClassObj = {
			header: 	['auth'],
			sidebar: 	['auth'],
			section: 	['auth'],
			footer: 	['auth']
		}
		var tagPropertyArr = [];
		var ejsAddress = {
			header: null,
			sidebar: null,
			section: null,
			footer: null
		}

		getAvatar(function() {
			pushAvatarIntoTagClassObj(function() {
				makeTagPropertyArrbyTagClassObj(function() {
					findEjsAndUpdateEjsAddressByTagPropertyObj(function() {
						checkEjsAddress(function() {
							renderToPath(function() {

								console.log(ejsAddress);
							});
						});
					});
				});
			});
		});


		function getAvatar (callback) {
			if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
				avatar.auth = 'auth';
			}
			callback();
		}
		function pushAvatarIntoTagClassObj (callback) {
			for (var i = 0; i < Object.keys(tagClassObj).length; i++) {
				for (var j = 0; j < tagClassObj[Object.keys(tagClassObj)[i]].length; j++) {
					for (var k = 0; k < Object.keys(avatar).length; k++) {
						if (tagClassObj[Object.keys(tagClassObj)[i]][j] == Object.keys(avatar)[k]) {
							tagClassObj[Object.keys(tagClassObj)[i]][j] = avatar[Object.keys(avatar)[k]];
							break;
						}
					}
				}
			}
// console.log('tagClassObj: ');
// console.log(tagClassObj);	
// console.log('\n');
			callback();
		}
		function makeTagPropertyArrbyTagClassObj (callback) {
			for (var i = 0; i < Object.keys(tagClassObj).length; i++) {
				var objKey = Object.keys(tagClassObj)[i];
				var tempObj = {
					tag: '',
					classes: [],
					path: ''
				}
				tempObj.tag = objKey;
				if (tempObj.tag == 'section') tempObj.path = path;
				for (var j = 0; j < tagClassObj[objKey].length; j++) {
					var objValue = tagClassObj[objKey][j];
					tempObj.classes.push(objValue);
				}
				tagPropertyArr.push(tempObj);
			}
// console.log('tagPropertyArr: ');
// console.log(tagPropertyArr);	
// console.log('\n');
			callback();
		}
		function findEjsAndUpdateEjsAddressByTagPropertyObj (callback) {
			for (var i = 0; i < tagPropertyArr.length; i++) {
				for (var j = 0; j < ejsListArr.length; j++) {
					if (tagPropertyArr[i].tag == ejsListArr[j].properties.tag) {
						if (tagPropertyArr[i].path) {
							if (tagPropertyArr[i].path == ejsListArr[j].properties.path) {
								
								for (var k = 0; k < tagPropertyArr[k].classes.length; k++) {
									var classCount = 0;
									if ((tagPropertyArr[i].classes[k] == ejsListArr[j].properties.classes[k]) || ('default' == ejsListArr[j].properties.classes[k])) {
										classCount++;
										if (classCount == tagPropertyArr[k].classes.length) {
											ejsAddress[tagPropertyArr[i].tag] = ejsListArr[j].name;
										}
									}
								}
							}
						} else {
							for (var k = 0; k < tagPropertyArr[k].classes.length; k++) {
								var classCount = 0;
								if ((tagPropertyArr[i].classes[k] == ejsListArr[j].properties.classes[k]) || ('default' == ejsListArr[j].properties.classes[k])) {
									classCount++;
									if (classCount == tagPropertyArr[k].classes.length) {
										ejsAddress[tagPropertyArr[i].tag] = ejsListArr[j].name;
									}
								}
							}
						}
					}
				}
			}
// console.log('ejsAddress: ');
// console.log(ejsAddress);	
// console.log('\n');
			callback();
		}
		function checkEjsAddress (callback) {
			for (var i = 0; i < Object.keys(ejsAddress).length; i++) {
				if (!ejsAddress[Object.keys(ejsAddress)[i]]) {
					res.render('./layout.error@missingComponent.ejs');
					ejsAddress = null;
					break;
				}
			}
			callback();
		}
		function renderToPath (callback) {
			if (ejsAddress) {
				if (obj) {
					var classCount = 0;

					for (var i = 0; i < obj.classes.length; i++) {
						for (var j = 0; j < Object.keys(avatar).length; j++) {
							if (obj.classes[i] == avatar[Object.keys(avatar)[j]]) classCount++;
						}
					}
					if (classCount == obj.classes.length) {
						res.render('./layout', {ejsAddress: ejsAddress, address: address, obj: obj.contents});
					} else {
						res.render('./layout', {ejsAddress: ejsAddress, address: address});
					}
				} else {
					res.render('./layout', {ejsAddress: ejsAddress, address: address});
				}
			}
			callback();
		}
	}

	function makeEjsListArr () {
		fs.readdir('../pineapple/views', function (err, files) {
			if (err) throw err;

			for (var i = 0; i < files.length; i++) {
				if (files[i].split('.')[0] !== 'layout') {
					var fileObj = {
						name: '',
						properties: {
							tag: '',
							classes: [],
							path: '',
							id: ''
						}
					};
					fileObj.name = files[i];
					var fileStr = files[i].split('.ejs')[0];
					if (fileStr.split('@')[1]) {
						fileObj.properties.path = fileStr.split('@')[1];
						fileStr = fileStr.split('@')[0];
					}
					var splittedFile = fileStr.split('.');
					if (splittedFile.length > 1) {
						for (var j = 0; j < splittedFile.length; j++) {
							if (j == 0) {
								fileObj.properties.tag = splittedFile[j];
							} else {
								fileObj.properties.classes.push(splittedFile[j]);
							}
						}
					} else {
						fileObj.properties.tag = splittedFile[0];
					}

					ejsListArr.push(fileObj);
				}
			}
		});
	}
}

module.exports = Ejs_pine