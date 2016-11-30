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
	var getVideoArrUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId='+ playListId +'&access_token='+ accessToken +'&maxResults=50';
	getHttpRequest(getVideoArrUrl, function (result) {
// console.log(JSON.parse(result));
		var videoArr = JSON.parse(result).items;
		var rootDivTag = document.getElementById('javascript');
		for (var i = 0; i < videoArr.length; i++) {
			var leftSide = document.getElementById('motherboard_left_side');

			var videoThumbnailsContainer = document.createElement('div');
			var videoThumbnailsImgContainer = document.createElement('div');
			var videoThumbnailsProperties = document.createElement('div');
			var videoThumbnailsImg = document.createElement('img');
			var videoPlayButtonImg = document.createElement('img');
			videoThumbnailsContainer.classList.add('video_thumbnails_container');
			videoThumbnailsImgContainer.id = videoArr[i].snippet.resourceId.videoId;
			videoThumbnailsImgContainer.classList.add('video_thumbnails_img_container');
			videoThumbnailsImg.src = videoArr[i].snippet.thumbnails.default.url;
			videoThumbnailsImg.classList.add('video_thumbnails_img');
			videoPlayButtonImg.src = '/img/youtube_play_button.png';
			videoPlayButtonImg.classList.add('video_thumbnails_play_button');
			videoThumbnailsProperties.classList.add('video_thumbnails_properties');
			videoThumbnailsProperties.innerText = 'Title: '+ videoArr[i].snippet.title +'\nUpdate Date: '+ videoArr[i].snippet.publishedAt.split('T')[0];

			videoThumbnailsImgContainer.appendChild(videoThumbnailsImg);
			videoThumbnailsImgContainer.appendChild(videoPlayButtonImg);
			videoThumbnailsContainer.appendChild(videoThumbnailsImgContainer);
			videoThumbnailsContainer.appendChild(videoThumbnailsProperties);
			rootDivTag.appendChild(videoThumbnailsContainer);
		}
		var videoThumbnailsContainerArr = document.getElementsByClassName('video_thumbnails_container');
		for (var i = 0; i < videoThumbnailsContainerArr.length; i++) {
			videoThumbnailsContainerArr[i].addEventListener('click', clickVideoThumbnailContainer);
		}
		var videoPlayButtonArr = document.getElementsByClassName('video_thumbnails_play_button');
		for (var i = 0; i < videoPlayButtonArr.length; i++) {
			videoPlayButtonArr[i].addEventListener('click', clickVideoPlayButton);
		}
		function clickVideoThumbnailContainer (event) {
			if (!event.target.style.background) {
				event.target.style.background = '#a8a8a8';
				event.target.style.color = '#fff';
			} else if (rgbToHex(event.target.style.background) == '#a8a8a8') {
				event.target.style.background = '#fff';
				event.target.style.color = '#555';
			} else if (rgbToHex(event.target.style.background) == '#ffffff') {
				event.target.style.background = '#a8a8a8';
				event.target.style.color = '#fff';
			}
			
		}
		function clickVideoPlayButton () {
			var section = document.getElementById('section_content_container');
			var newTag = document.createElement('div');
			var newIframe = document.createElement('iframe');
			newIframe.width = 300;
			newIframe.height = 171;
			newIframe.src = 'https://www.youtube.com/embed/'+ this.parentElement.id +'?showinfo=0&amp;autoplay=1';
			newIframe.frameborder = 0;
			newIframe.allowfullscreen = 1;
			newIframe.classList.add('video')
			newTag.classList.add('video_preview_iframe');
			newTag.appendChild(newIframe);
			section.appendChild(newTag);
		}
		function rgbToHex(col) {
		    if (col.charAt(0)=='r') {
		        col=col.replace('rgb(','').replace(')','').split(',');
		        var r=parseInt(col[0], 10).toString(16);
		        var g=parseInt(col[1], 10).toString(16);
		        var b=parseInt(col[2], 10).toString(16);
		        r=r.length==1?'0'+r:r; g=g.length==1?'0'+g:g; b=b.length==1?'0'+b:b;
		        var colHex='#'+r+g+b;
		        return colHex;
		    }
		}
	});
});

