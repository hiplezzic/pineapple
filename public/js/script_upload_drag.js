var dropSpot = document.getElementsByClassName('drop_spot');
var videoplayer = document.getElementById('upload_videoplayer');

for (var i = 0; i < dropSpot.length; i++) {
	dropSpot[i].addEventListener('dragenter', ondragenter);
	dropSpot[i].addEventListener('dragleave', ondragleave);
	dropSpot[i].addEventListener('dragover', ondragover);
	dropSpot[i].addEventListener('drop', ondrop);

}

function ondragenter (e) {
	e.stopPropagation();
	e.preventDefault();
	for (var i = 0; i < dropSpot.length; i++) {
		dropSpot[i].style.background = '#555';
	}
}
function ondragleave (e) {
	e.stopPropagation();
	e.preventDefault();
	for (var i = 0; i < dropSpot.length; i++) {
		dropSpot[i].style.background = '#fff';
	}
}
function ondragover (e) {
	e.stopPropagation();
	e.preventDefault();
}
function ondrop (e) {
	e.preventDefault();
	for (var i = 0; i < dropSpot.length; i++) {
		dropSpot[i].style.background = '#fff';
	}
	var ready = document.getElementById('upload_ready');
	var leftSide = document.getElementById('upload_left_side');
	var rightSide = document.getElementById('upload_right_side');
	ready.classList.add('hidden');
	leftSide.classList.remove('hidden');
	rightSide.classList.remove('hidden');
	var file = e.dataTransfer.files[0];
	var fileURL = URL.createObjectURL(file);
	videoplayer.src = fileURL;
}


