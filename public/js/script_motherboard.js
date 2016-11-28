//-------------------------
// /public/js/script_motherboard.js
//-------------------------

function getHttpRequest(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}
var accessToken = document.cookie.split('=')[1];
var getPlayListIdUrl = 'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&access_token='+ accessToken;

getHttpRequest(getPlayListIdUrl, function (result) {
	var playListId = JSON.parse(result).items[0].contentDetails.relatedPlaylists.uploads;
	var getVideoArrUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId='+ playListId +'&access_token='+ accessToken +'&maxResults=50';
	getHttpRequest(getVideoArrUrl, function (result) {
		//console.log(JSON.parse(result).items[0].contentDetails.videoId);
		var videoArr = JSON.parse(result).items;
		var startdiv = document.getElementById('javascript');

		for (var i = 0; i < videoArr.length; i++) {
			var tag = document.createElement('iframe');
			tag.width = 223;
			tag.height = 125;
			tag.src = 'https://www.youtube.com/embed/'+ videoArr[i].contentDetails.videoId;
			startdiv.appendChild(tag);
		}
	});
});