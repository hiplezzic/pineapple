//-------------------------------------
// /node_js/youtube_pine.js
//-------------------------------------
function Youtube_pine () {

	var request = require('request');

	this.getPlayListItemObjArr = function (accessToken, maxResults, nextPageToken, callback) {
		var accessToken = accessToken;
		var url = 'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&access_token='+ accessToken;
		request(url, function(err, res, body) {
			var playListId = JSON.parse(body).items[0].contentDetails.relatedPlaylists.uploads;
			if (nextPageToken) {
				var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=id%2Csnippet%2CcontentDetails%2Cstatus&playlistId='+ playListId +'&maxResults='+ maxResults +'&access_token='+ accessToken +'&pageToken='+ nextPageToken;
			} else {
				var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=id%2Csnippet%2CcontentDetails%2Cstatus&playlistId='+ playListId +'&maxResults='+ maxResults +'&access_token='+ accessToken;
			}
			request(url, function(err, res, body) {
				if (JSON.parse(body).hasOwnProperty('nextPageToken')) {
					callback(JSON.parse(body).items, JSON.parse(body).nextPageToken);	
				} else {
					callback(JSON.parse(body).items);
				}
			});
		});
	},
	this.refineYoutubeObjToUnstratifiedObj = function (youtubeObj, callback) {
		unstratifyObj(youtubeObj, function (result) {
			callback(result);
		});

		function unstratifyObj (obj, callback) {
			var obj = obj;

			for (var i = 0; i < Object.keys(obj).length; i++) {
				var key = Object.keys(obj)[i];
				if (typeof(obj[key]) == 'object') {
					for (var j = 0; j < Object.keys(obj[key]).length; j++) {
						var childKey = Object.keys(obj[key])[j];
						obj[key +'_'+ childKey] = obj[key][childKey];
					}
					delete obj[key];
				}
			}
			checkUnstratifiedObj(obj, function (result) {

				callback(result);
			});
		}

		function checkUnstratifiedObj (obj, callback) {
			var obj = obj
			var flag = false;

			for (var i = 0; i < Object.keys(obj).length; i++) {
				var key = Object.keys(obj)[i];
				if (typeof(obj[key]) == 'object') {
					flag = true;
					break;
				}
			}
			if (flag) {
				unstratifyObj(obj, function (result) {
					callback(result);
				});
			} else {
				callback(obj);
			}
		}
	},
	this.extractRequiredObjForDb = function (obj, arr, callback) {
		var resultArr = arr;
		var resultObj = {};
		if (!arr) {
			var resultArr = [
				['etag', 'etag'],
				['id', 'id'],
				['status_privacyStatus', 'privacyStatus_youtube'],
				['snippet_publishedAt', 'publishedAt'],
				['snippet_channelId', 'channelId'],
				['snippet_playlistId', 'playlistId'],
				['snippet_title', 'title_youtube'],
				['snippet_description', 'description_youtube'],
				['snippet_channelTitle', 'channelTitle'],
				['snippet_resourceId_videoId', 'videoId'],
				['snippet_thumbnails_default_url', 'thumbnails_default_url'],
				['snippet_thumbnails_default_width', 'thumbnails_default_width'],
				['snippet_thumbnails_default_height', 'thumbnails_default_height'],
				['snippet_thumbnails_medium_url', 'thumbnails_medium_url'],
				['snippet_thumbnails_medium_width', 'thumbnails_medium_width'],
				['snippet_thumbnails_medium_height', 'thumbnails_medium_height'],
				['snippet_thumbnails_high_url', 'thumbnails_high_url'],
				['snippet_thumbnails_high_width', 'thumbnails_high_width'],
				['snippet_thumbnails_high_height', 'thumbnails_high_height'],
				['snippet_thumbnails_standard_url', 'thumbnails_standard_url'],
				['snippet_thumbnails_standard_width', 'thumbnails_standard_width'],
				['snippet_thumbnails_standard_height', 'thumbnails_standard_height']
			];
		}
		for (var i = 0; i < Object.keys(obj).length; i++) {
			var key = Object.keys(obj)[i];
			for (var j = 0; j < resultArr.length; j++) {
				if (key == resultArr[j][0]) {
					resultObj[resultArr[j][1]] = obj[key];
					break;
				}
			}
		}
		callback(resultObj);
	},
	this.getRefinedYoutubeObj = function (accessToken, maxResults, nextPageToken, callback) {
		var resultObjArr = [];
		combineResultArrs(resultObjArr, null, function (result) {
			var resultLength = result.length;
			var unstratifyObjArr = [];
			for (var i = 0; i < resultLength; i++) {
				this.refineYoutubeObjToUnstratifiedObj(result[i], function (result) {
					this.extractRequiredObjForDb (result, null, function (result) {
						unstratifyObjArr.push(result);
					});
				});
			}
			callback(unstratifyObjArr);
		});

		var combineResultArrs = function (previousResultArr, nextPageToken, callback) {
			this.getPlayListItemObjArr(accessToken, maxResults, nextPageToken, function (result, nextPageToken) {
				for (var i = 0; i < result.length; i++) {
					previousResultArr.push(result[i]);
				}
				if (nextPageToken) {
					combineResultArrs (previousResultArr, nextPageToken, function (result) {
						callback(result);
					});
				} else {
					callback(previousResultArr);
				}
			});
		}.bind(this);
	}

	this.updatePjClientYoutubeInfo = function (nickname, accessToken, callback) {

		// id는 같되, etag 다른 자료 추출
		// 다른 자료 update
		// 그중 pj=true인 것들 board 값 update
		var pj = req.session.passport.user.pj;
		if (pj) {
//console.log('Start!');
			youtubePine.getRefinedYoutubeObj(accessToken, 50, null, function (result) {
				var query = 'SELECT * FROM youtube WHERE nickname=?';
				mysqlConnection.query(query, [nickname], function (err, mysqlResultYoutube, fields) {
console.log(mysqlResultYoutube.length);
					if (err) throw err;
					for (var i = result.length - 1; i >= 0; i--) {
						var resultObj = result[i];
console.log('rslt: '+ i + ' ' + resultObj.title_youtube);
						var flag = false;
						for (var j = mysqlResultYoutube.length - 1; j >= 0; j--) {
							var mysqlResultYoutubeObj = mysqlResultYoutube[j];
console.log('rows: '+ j + ' ' + mysqlResultYoutube.length);
							if (resultObj.id == mysqlResultYoutubeObj.id) {
								flag = true;
								if (resultObj.etag !== mysqlResultYoutubeObj.etag) {
console.log(j +'_ find******')
console.log(resultObj.title_youtube+'/  /'+resultObj.etag)
									// update해야할 항목 발견시
									// update해야할 항목만 추출
									var tempKeyArr = [];
									var tempValueArr = [];
									for (var k = 0; k < Object.keys(resultObj).length; k++) {
										var resultObjKey = Object.keys(resultObj)[k];
										if (String(resultObj[resultObjKey]) !== String(mysqlResultYoutubeObj[resultObjKey])) {
											tempKeyArr.push(resultObjKey);
											tempValueArr.push(resultObj[resultObjKey]);
										}
									}
									mysqlPine.updateValues('youtube', tempKeyArr, tempValueArr, 'id=\''+ resultObj.id +'\'', function () {
									});
									if (mysqlResultYoutubeObj.uploaded) {
										var tempBoardKeyArr = [];
										var tempBoardValueArr = [];
										var boardKeys = [
											'title_youtube', 
											'description_youtube', 
											'privacyStatus_youtube', 
											'thumbnails_standard_url',
											'thumbnails_default_url',
											'thumbnails_medium_url',
											'thumbnails_high_url'
										];
										for (var k = 0; k < boardKeys.length; k++) {
											if (boardKeys[k].split('_youtube').length > 1) {
												var boardKey = boardKeys[k].split('_youtube')[0];
												if ((tempKeyArr.indexOf(boardKeys[k]) !== -1) && !mysqlResultYoutubeObj[boardKey +'_pineapple']) {
													tempBoardKeyArr.push(boardKey);
													tempBoardValueArr.push(tempValueArr[tempKeyArr.indexOf(boardKeys[k])]);
												}
											} else {
												var boardKey = boardKeys[k];
												if (tempKeyArr.indexOf(boardKeys[k]) !== -1) {
													tempBoardKeyArr.push(boardKey);
													tempBoardValueArr.push(tempValueArr[tempKeyArr.indexOf(boardKeys[k])]);
												}
											}
										}
										(function (j) {
											mysqlResultYoutube.splice(j, 1);
											mysqlPine.updateValues('board', tempBoardKeyArr, tempBoardValueArr, 'id=\''+ resultObj.id +'\'', function () {
											});
										})(j)
									} else {
										mysqlResultYoutube.splice(j, 1);
									}
									break;
								} else if (resultObj.etag == mysqlResultYoutubeObj.etag) {
									mysqlResultYoutube.splice(j, 1);
								}
							}
						}
						if (!flag) {
							// insert해야할 항목 발견시
							resultObj['nickname'] = nickname;
							var columnArr = [];
							var valueArr = [];
							for (var k = 0; k < Object.keys(resultObj).length; k++) {
								var key = Object.keys(resultObj)[k];
								columnArr.push(key);
								valueArr.push(resultObj[key]);
							}
							(function (j) {
								mysqlPine.insertValues('youtube', columnArr, valueArr, function () {
console.log('INSERT changes');
								});
							})(j)
						}
					}
					if (mysqlResultYoutube.length) {
						// delete해야할 항목 발견시
						var query = 'DELETE FROM youtube WHERE id=?';
						for (var i = 0; i < mysqlResultYoutube.length; i++) {
							(function (i) {
console.log(mysqlResultYoutube[i]);
								mysqlConnection.query(query, [mysqlResultYoutube[i].id], function (err, rows, field) {
									if (err) throw err;
console.log(i);
									if (mysqlResultYoutube[i].uploaded) {
										var queryBoard = 'DELETE FROM board WHERE id=?';
										mysqlConnection.query(queryBoard, [mysqlResultYoutube[i].id], function (err, rows, fields) {
										});
									}
console.log('DELETE changes');
								});
							})(i)
						}
					}
				});
			});
		}
	}
}

module.exports = Youtube_pine;