var accessToken = document.cookie.split('=')[1];

var UploadVideo = function () {
	this.videoId = '';
	this.uploadStartTime = 0;
	this.authenticated = true;
}

UploadVideo.prototype.handleUploadClicked = function() {
	var optionsObj = {
		metadata: {
			snippet: {},
			status: {}
		}
	}
	optionsObj.accessToken = accessToken;
	optionsObj.file = document.getElementsByName('file')[0].files[0];
	optionsObj.metadata.snippet.title = document.getElementsByName('title')[0].value;
	optionsObj.metadata.snippet.description = document.getElementsByName('description')[0].value;
	optionsObj.metadata.snippet.tags = ['youtube-cors-upload'];
	optionsObj.metadata.snippet.categoryId = 22;
	var radioArr = document.getElementsByName('privacyStatus');
	for (var i = 0; i < radioArr.length; i++) {
		if (radioArr[i].checked) {
			optionsObj.metadata.status.privacyStatus = radioArr[i].value;
		}
	}

	this.uploadFile(optionsObj);
};

UploadVideo.prototype.uploadFile = function(optionsObj) {
	var uploader = new MediaUploader({
		baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
		file: optionsObj.file,
		token: optionsObj.accessToken,
		metadata: optionsObj.metadata,
		params: {
			part: Object.keys(optionsObj.metadata).join(',')
		},
		onError: function(data) {
			var message = data;
      // Assuming the error is raised by the YouTube API, data will be
      // a JSON string with error.message set. That may not be the
      // only time onError will be raised, though.
      		try {
      			var errorResponse = JSON.parse(data);
      			message = errorResponse.error.message;
      		} finally {
      			alert(message);
      		}
      	}.bind(this),
      	onProgress: function(data) {
      		var currentTime = Date.now();
      		var bytesUploaded = data.loaded;
      		var totalBytes = data.total;
      // The times are in millis, so we need to divide by 1000 to get seconds.
			var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
			var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
			var percentageComplete = (bytesUploaded * 100) / totalBytes;

console.log(percentageComplete);
      /*$('#upload-progress').attr({
        value: bytesUploaded,
        max: totalBytes
      });
			
      $('#percent-transferred').text(percentageComplete);
      $('#bytes-transferred').text(bytesUploaded);
      $('#total-bytes').text(totalBytes);

      $('.during-upload').show();*/
		}.bind(this),
		onComplete: function(data) {
			var uploadResponse = JSON.parse(data);
			this.videoId = uploadResponse.id;
console.log('Finished!');
			
			var getPlayListIdUrl = 'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&access_token='+ accessToken;
			sendxmlHttpRequest('GET', getPlayListIdUrl, '', function (result) {
				var playListId = JSON.parse(result).items[0].contentDetails.relatedPlaylists.uploads;
				var getPlayListItemUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=id%2Csnippet%2CcontentDetails%2Cstatus&playlistId='+ playListId +'&maxResults=1&access_token='+ accessToken;
				sendxmlHttpRequest('GET', getPlayListItemUrl, '', function (result) {
					var resultObj = JSON.parse(result).items[0];
					function objectCombine (params, callback) {
						first(params, function (result) {
							callback(result)
						});

						function first (params, callback) {
							for (var i = 0; i < Object.keys(params).length; i++) {
								if (typeof(params[Object.keys(params)[i]]) == 'object') {
									for (var j = 0; j < Object.keys(params[Object.keys(params)[i]]).length; j++) {
										params[Object.keys(params)[i] +'_'+ Object.keys(params[Object.keys(params)[i]])[j]] = params[Object.keys(params)[i]][Object.keys(params[Object.keys(params)[i]])[j]];
									}
									delete params[Object.keys(params)[i]];
								}
							}
							second (params, function (result) {
								callback(result);
							});
						}
						function second (params, callback) {
							for (var i = 0; i < Object.keys(params).length; i++) {
								if (typeof(params[Object.keys(params)[i]]) == 'object') {
									first(params, function(result) {
										callback(result);
									});
								}
							}
							callback(params);
						}
					}
					function buildQuery (params) {
						return Object.keys(params).map(function(key) {
							if (typeof(params[key]) == 'object') {
								return buildQuery(params[key]);
							} else {
								return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
							}
						}).join('&');
					};

					var url = 'http://localhost:81/upload/youtube';
					//var query = 'etag='+ resultObj.etag +'&id='+ resultObj.id +'&videoId='+ resultObj.contentDetails.videoId;
					var query = '';
					objectCombine(resultObj, function (result) {
						query = buildQuery(result);
					});
					sendxmlHttpRequest('POST', url, query, function (result) {
						console.log('post to localhost');
					});
				});
			});

			function sendxmlHttpRequest(method, url, query, callback) {
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.onreadystatechange = function() { 
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						callback(xmlHttp.responseText);
					}
				}
				xmlHttp.open(method, url, true); // true for asynchronous 
				if (method == 'POST') {
					xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				}
				xmlHttp.send(query);	
			}


			/*$('#video-id').text(this.videoId);
			$('.post-upload').show();*/
			this.pollForVideoStatus();
			}.bind(this)
		});
  // This won't correspond to the *exact* start of the upload, but it should be close enough.

	this.uploadStartTime = Date.now();
	uploader.upload();
};

UploadVideo.prototype.pollForVideoStatus = function() {
  this.gapi.client.request({
    path: '/youtube/v3/videos',
    params: {
      part: 'status,player',
      id: this.videoId
    },
    callback: function(response) {
      if (response.error) {
        // The status polling failed.
        console.log(response.error.message);
        setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
      } else {
        var uploadStatus = response.items[0].status.uploadStatus;
        switch (uploadStatus) {
          // This is a non-final status, so we need to poll again.
          case 'uploaded':
            $('#post-upload-status').append('<li>Upload status: ' + uploadStatus + '</li>');
            setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
            break;
          // The video was successfully transcoded and is available.
          case 'processed':
            $('#player').append(response.items[0].player.embedHtml);
            $('#post-upload-status').append('<li>Final status.</li>');
            break;
          // All other statuses indicate a permanent transcoding failure.
          default:
            $('#post-upload-status').append('<li>Transcoding failed.</li>');
            break;
        }
      }
    }.bind(this)
  });
};

var MediaUploader = function(options) {
	var noop = function() {};
	this.file = options.file;
	this.contentType = options.contentType || this.file.type || 'application/octet-stream';
	this.metadata = options.metadata || {
		'title': this.file.name,
		'mimeType': this.contentType
	};
	this.token = options.token;
	this.onComplete = options.onComplete || noop;
	this.onProgress = options.onProgress || noop;
	this.onError = options.onError || noop;
	this.offset = options.offset || 0;
	this.chunkSize = options.chunkSize || 0;
	this.retryHandler = new RetryHandler();

	this.url = options.url;
	if (!this.url) {
		var params = options.params || {};
		params.uploadType = 'resumable';
		this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
	}
	this.httpMethod = options.fileId ? 'PUT' : 'POST';
};

/**
 * Initiate the upload.
 */
MediaUploader.prototype.upload = function() {
	var self = this;
	var xhr = new XMLHttpRequest();

	xhr.open(this.httpMethod, this.url, true);
		xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
	xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

	xhr.onload = function(e) {
		if (e.target.status < 400) {
			var location = e.target.getResponseHeader('Location');
			this.url = location;
console.log('Start sendFile_');
			this.sendFile_();
		} else {
console.log('Error before sendFile_');
			this.onUploadError_(e);
		}
	}.bind(this);
	xhr.onerror = this.onUploadError_.bind(this);
	xhr.send(JSON.stringify(this.metadata));
};

/**
 * Send the actual file content.
 *
 * @private
 */
MediaUploader.prototype.sendFile_ = function() {
	var content = this.file;
	var end = this.file.size;

	if (this.offset || this.chunkSize) {
    // Only bother to slice the file if we're either resuming or uploading in chunks
		if (this.chunkSize) {
			end = Math.min(this.offset + this.chunkSize, this.file.size);
		}
		content = content.slice(this.offset, end);
	}

	var xhr = new XMLHttpRequest();
	xhr.open('PUT', this.url, true);
	xhr.setRequestHeader('Content-Type', this.contentType);
	xhr.setRequestHeader('Content-Range', "bytes " + this.offset + "-" + (end - 1) + "/" + this.file.size);
	xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
	if (xhr.upload) {
		xhr.upload.addEventListener('progress', this.onProgress);
	}
	xhr.onload = this.onContentUploadSuccess_.bind(this);
	xhr.onerror = this.onContentUploadError_.bind(this);
	xhr.send(content);
};

/**
 * Query for the state of the file for resumption.
 *
 * @private
 */
MediaUploader.prototype.resume_ = function() {
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', this.url, true);
	xhr.setRequestHeader('Content-Range', "bytes */" + this.file.size);
	xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
	if (xhr.upload) {
		xhr.upload.addEventListener('progress', this.onProgress);
	}
	xhr.onload = this.onContentUploadSuccess_.bind(this);
	xhr.onerror = this.onContentUploadError_.bind(this);
	xhr.send();
};

/**
 * Extract the last saved range if available in the request.
 *
 * @param {XMLHttpRequest} xhr Request object
 */
MediaUploader.prototype.extractRange_ = function(xhr) {
	var range = xhr.getResponseHeader('Range');
	if (range) {
		this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
	}
};

/**
 * Handle successful responses for uploads. Depending on the context,
 * may continue with uploading the next chunk of the file or, if complete,
 * invokes the caller's callback.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onContentUploadSuccess_ = function(e) {
	if (e.target.status == 200 || e.target.status == 201) {
		this.onComplete(e.target.response);
	} else if (e.target.status == 308) {
		this.extractRange_(e.target);
		this.retryHandler.reset();
		this.sendFile_();
	} else {
		this.onContentUploadError_(e);
	}
};

/**
 * Handles errors for uploads. Either retries or aborts depending
 * on the error.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onContentUploadError_ = function(e) {
	if (e.target.status && e.target.status < 500) {
		this.onError(e.target.response);
	} else {
		this.retryHandler.retry(this.resume_.bind(this));
	}
};

/**
 * Handles errors for the initial request.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onUploadError_ = function(e) {
	this.onError(e.target.response); // TODO - Retries for initial upload
};

/**
 * Construct a query string from a hash/object
 *
 * @private
 * @param {object} [params] Key/value pairs for query string
 * @return {string} query string
 */
MediaUploader.prototype.buildQuery_ = function(params) {
	params = params || {};
	return Object.keys(params).map(function(key) {
		return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	}).join('&');
};

/**
 * Build the drive upload URL
 *
 * @private
 * @param {string} [id] File ID if replacing
 * @param {object} [params] Query parameters
 * @return {string} URL
 */
MediaUploader.prototype.buildUrl_ = function(id, params, baseUrl) {
	var url = baseUrl || 'https://www.googleapis.com/upload/drive/v2/files/';
	if (id) {
		url += id;
	}
	var query = this.buildQuery_(params);
	if (query) {
		url += '?' + query;
	}
	return url;
};

/**
 * Helper for implementing retries with backoff. Initial retry
 * delay is 1 second, increasing by 2x (+jitter) for subsequent retries
 *
 * @constructor
 */
var RetryHandler = function() {
  this.interval = 1000; // Start at one second
  this.maxInterval = 60 * 1000; // Don't wait longer than a minute 
};

/**
 * Invoke the function after waiting
 *
 * @param {function} fn Function to invoke
 */
RetryHandler.prototype.retry = function(fn) {
  setTimeout(fn, this.interval);
  this.interval = this.nextInterval_();
};

/**
 * Reset the counter (e.g. after successful request.)
 */
RetryHandler.prototype.reset = function() {
  this.interval = 1000;
};

/**
 * Calculate the next wait time.
 * @return {number} Next wait interval, in milliseconds
 *
 * @private
 */
RetryHandler.prototype.nextInterval_ = function() {
  var interval = this.interval * 2 + this.getRandomInt_(0, 1000);
  return Math.min(interval, this.maxInterval);
};

/**
 * Get a random int in the range of min to max. Used to add jitter to wait times.
 *
 * @param {number} min Lower bounds
 * @param {number} max Upper bounds
 * @private
 */
RetryHandler.prototype.getRandomInt_ = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};