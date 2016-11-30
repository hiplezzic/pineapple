/**
* /public/js/script_css.js
*/

window.onload = function () {
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var headerTag = document.getElementById('header');
  var footerTag = document.getElementById('footer');
  var headerHeight = window.getComputedStyle(headerTag, null).getPropertyValue('height').split('px')[0];
  var footerHeight = window.getComputedStyle(footerTag, null).getPropertyValue('height').split('px')[0];
  
  console.log(headerHeight +'_'+ footerHeight)
  var container = document.getElementById('motherboard_container');
  container.style.height = (windowHeight - headerHeight - footerHeight) +'px';
}