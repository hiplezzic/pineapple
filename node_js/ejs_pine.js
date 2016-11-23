//-------------------------------------
// /node_js/ejs_pine.js
//-------------------------------------

function Ejs_pine () {

	var fs = require('fs');

	var hrefAddress = {
		home: '/',
		register: '/auth/register',
		login_local: '/auth/login',
		login_google: '/auth/google',
		logout: '/auth/logout',
		withdrawal: '/auth/withdrawal',
		write_post: '/post/writepost',
		search: '/post/search',
		archive: '/post/archive',
		post: '/post/no/',
		upload: '/upload/youtube'
	}

	this.findEjsAddress = function (req, res, path, obj) {
		var avatar = {
			auth: false
		}
		var ejsAddress = {
			header: '',
			sidebar: '',
			section: '',
			footer: 'footer.default.ejs'
		}

		if (req.session.passport && req.session.passport.hasOwnProperty('user')) {
			avatar.auth = true;
		}

		if (avatar.auth) {
			ejsAddress.header = './header.auth.ejs';
			ejsAddress.sidebar = './sidebar.auth.ejs';
		} else {
			ejsAddress.header = './header.unauth.ejs';
			ejsAddress.sidebar = './sidebar.unauth.ejs';
		}

		fs.readdir('./views', function (err, files) {
			if(err) throw err;

			var tempArr = [];
			var idArr = [];

			files.forEach(function(file) {
				if (file.indexOf('#'+ path) !== -1) tempArr.push(file);
			});

			tempArr.forEach(function(file) {
				var tempStr = '';
				if (avatar.auth) {
					tempStr = 'auth';
				} else {
					tempStr = 'unauth';
				}
				if ((file.indexOf('.default') !== -1) || (file.indexOf('.'+ tempStr) !== -1)) idArr.push(file);
			});

			if (idArr.length == 0) {
				ejsAddress.section = './section.default#error#nopath.ejs';
				res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress});
			} else if (idArr.length == 1) {
				ejsAddress.section = idArr[0];
				if (obj) {
					var classCount = 0;
					for (var i = 0; i < obj.classes.length; i++) {
						if (idArr[0].indexOf('.'+ obj.classes[i]) !== -1) classCount++;
					}
					if (classCount == obj.classes.length) {
						res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress, obj: obj});
					} else {
						res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress});
					}
				} else {
					res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress});
				}
			} else {
				ejsAddress.section = './section.default#error#unknown.ejs';
				res.render('./layout', {ejsAddress: ejsAddress, hrefAddress: hrefAddress, errStr: '복수의 경로가 검색되었습니다.'});
			}
		});
	}
}

module.exports = Ejs_pine