//-------------------------------------
// /node_js/youtube_pine.js
//-------------------------------------

var request = require('request');

var youtubePine = {
	getPlayListItemObjArr: function (accessToken, maxResults, nextPageToken, callback) {
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
	refineYoutubeObjToUnstratifiedObj: function (youtubeObj, callback) {
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
	extractRequiredObjForDb: function (obj, arr, callback) {
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
	getRefinedYoutubeObj: function (accessToken, maxResults, nextPageToken, callback) {
		var resultObjArr = [];
		combineResultArrs(resultObjArr, null, function (result) {
			var resultLength = result.length;
			var unstratifyObjArr = [];
			for (var i = 0; i < resultLength; i++) {
				youtubePine.refineYoutubeObjToUnstratifiedObj(result[i], function (result) {
					youtubePine.extractRequiredObjForDb (result, null, function (result) {
						unstratifyObjArr.push(result);
					});
				});
			}
			callback(unstratifyObjArr);
		});

		function combineResultArrs (previousResultArr, nextPageToken, callback) {
			youtubePine.getPlayListItemObjArr(accessToken, maxResults, nextPageToken, function (result, nextPageToken) {
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
		}
	}
}

module.exports = youtubePine;