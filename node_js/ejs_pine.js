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
console.log('tagClassObj: ');
console.log(tagClassObj);	
console.log('\n');
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
console.log('tagPropertyArr: ');
console.log(tagPropertyArr);	
console.log('\n');
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
console.log('ejsAddress: ');
console.log(ejsAddress);	
console.log('\n');
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
						res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress, obj: obj.contents});
					} else {
						res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress});
					}
				} else {
					res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress});
				}
			}
			callback();
		}
/*
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
										if (('.'+ totalArr[i].split('.')[k+1].indexOf('.'+ classList[Object.keys(classList)[j]][k]) !== -1) || (totalArr[i].split('.')[k+1].indexOf('.default') !== -1)) {
console.log('total: .'+ totalArr[i].split('.')[k+1]);
console.log('class: .'+ classList[Object.keys(classList)[j]][k] +' indexOf: '+ Boolean(totalArr[i].split('.')[k+1].indexOf('.'+ classList[Object.keys(classList)[j]][k]) !== -1) +' default: '+ Boolean(totalArr[i].split('.')[k+1].indexOf('.default')) !== -1);
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
		*/
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