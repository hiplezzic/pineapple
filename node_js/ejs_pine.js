//-------------------------------------
// /node_js/ejs_pine.js
//-------------------------------------

function Ejs_pine () {

	var fs = require('fs');
	var async = require('async');

	var hrefAddress = {
		home: 		'/',
		register: 		'/auth/register',
		login_local: 	'/auth/login',
		login_google: 	'/auth/google',
		logout: 		'/auth/logout',
		withdrawal: 	'/auth/withdrawal',
		write_post: '/post/writepost',
		search: 	'/post/search',
		archive: 	'/post/archive',
		post: 		'/post/no/',
		upload: 	'/upload/youtube'
	}	

	this.findEjsAddress = function (req, res, path, obj) {
		var classList = {
			header: 	['auth', 'porc'],
			sidebar: 	['auth'],
			section: 	['auth'],
			footer: 	[]
		}
		var avatar = {
			auth: 'unauth',
			porc: 'default'
		}
		var ejsAddress = {
			header: null,
			sidebar: null,
			section: null,
			footer: null
		}

		getAvatar(req, avatar, function(avatar) {
			findComponent(classList, avatar, path, ejsAddress, function(ejsAddress) {
				if (ejsAddress) {
					if (obj) {
						var classCount = 0;

						for (var i = 0; i < obj.classes.length; i++) {
							for (var j = 0; j < Object.keys(avatar).length; j++) {
								if (obj.classes[i] == avatar[Object.keys(avatar)[j]]) classCount++;
							}
						}
						if (classCount == obj.classes.length) {
							res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress, obj: obj.contents});
						} else {
							res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress});
						}
					} else {
						res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress});
					}
				}
			});
		});


		function getAvatar (req, avatar, callback) {
			var avatar = avatar;
			if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
				avatar.auth = 'auth';
			}
			callback(avatar);
		}
		function findComponent (classList, avatar, path, ejsAddress, callback) {
			var classList = classList;
			var avatar = avatar;
			var ejsAddress = ejsAddress;

			convertClassListByAvatar(classList, avatar, function(classList) {
				fs.readdir('./views', function (err, files) {
					if (err) throw err;
					makeEjsAddress(classList, files, function(ejsAddress) {
						callback(ejsAddress);
					});
				});
			});

			function convertClassListByAvatar (classList, avatar, callback) {
				for (var i = 0; i < Object.keys(classList).length; i++) {
					for (var j = 0; j < classList[Object.keys(classList)[i]].length; j++) {
						for (var k = 0; k < Object.keys(avatar).length; k++) {
							if (classList[Object.keys(classList)[i]][j] == Object.keys(avatar)[k]) {
								classList[Object.keys(classList)[i]][j] = avatar[Object.keys(avatar)[k]];
								break;
							}
						}
					}
				}
				callback(classList);
			}
			function makeEjsAddress (classList, files, callback) {
				var totalArr = files;

				makeEjsAddressObj(classList, totalArr, function(ejsAddress) {
					checkEjsAddressObj(ejsAddress, function(ejsAddress) {
						callback(ejsAddress);
					});
				});

				function makeEjsAddressObj (classList, totalArr, callback) {
					dealfooter(function() {
						for (var i = totalArr.length - 1; i >= 0; i--) {
							for (var j = 0; j < Object.keys(classList).length; j++) {
								if (totalArr[i].indexOf(Object.keys(classList)[j]) !== -1) {
									var classCount = 0;
									for (var k = 0; k < classList[Object.keys(classList)[j]].length; k++) {
										if ((totalArr[i].indexOf('.'+ classList[Object.keys(classList)[j]][k]) !== -1)) {
											classCount++;
											if (classCount == classList[Object.keys(classList)[j]].length) {
												if (Object.keys(classList)[j] == 'section') {
													if (totalArr[i].indexOf('#'+ path) !== -1) {
														ejsAddress[Object.keys(classList)[j]] = totalArr[i];
													} else {
														break;
													}
												} else {
													ejsAddress[Object.keys(classList)[j]] = totalArr[i];
												}
											}
										} else {
											break;
										}
									}
								} else {

								}
							}
						}
console.log(ejsAddress);
						callback(ejsAddress);
					});
					
					function dealfooter (callback) {
						for (var i = 0; i < Object.keys(classList).length; i++) {
							if (!classList[Object.keys(classList)[i]].length) {
								ejsAddress[Object.keys(classList)[i]] = Object.keys(classList)[i] +'.default.ejs';
							}
						}
						callback();
					}
				}
				function checkEjsAddressObj (ejsAddress, callback) {
					for (var i = 0; i < Object.keys(ejsAddress).length; i++) {
						if (!ejsAddress[Object.keys(ejsAddress)[i]]) {
							res.render('./layout#error#missingComponent.ejs');
							ejsAddress = null;
							break;
						}
					}
					callback(ejsAddress);
				}
			}
		}
	}
}

module.exports = Ejs_pine