//-------------------------
// /public/js/script.js
//-------------------------


window.onload = function () {
  
  /* When the user clicks on the button, 
  toggle between hiding and showing the dropdown content */
  /*function clickMenubar() {
      document.getElementById('dropdown').classList.toggle('show');
  }

  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('#dropdownButton')) {

      var dropdowns = document.getElementsByClassName("dropdown_contents");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }*/
console.log('style');
  var userGate = document.getElementById('user_gate');
  userGate.addEventListener('click', clickUserGate);


  function clickUserGate () {
    var classArr = document.getElementById('user_box').classList;
    var flag = false;
    for (var i = 0; i < classArr.length; i++) {
      if (classArr[i] == 'hidden') {
        flag = true;
      }
    }
    if (flag) {
      document.getElementById('user_box').classList.remove('hidden'); 
    } else {
      document.getElementById('user_box').classList.add('hidden'); 
    }
  }


/**
* /public/js/script_css.js
*/

  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var headerTag = document.getElementById('header');
  var headerComputedStyle = window.getComputedStyle(headerTag, null);
  var headerHeight = Number(headerComputedStyle.getPropertyValue('height').split('px')[0]);
  var headerBorderWidth = Number(headerComputedStyle.getPropertyValue('border-bottom-width').split('px')[0]);
  var footerTag = document.getElementById('footer');
  var footerComputedStyle = window.getComputedStyle(footerTag, null);
  var footerHeight = Number(footerComputedStyle.getPropertyValue('height').split('px')[0]);
  var footerBorderWidth = Number(footerComputedStyle.getPropertyValue('border-bottom-width').split('px')[0]);
  
  var container = document.getElementById('motherboard_container');
  var containerComputedStyle = window.getComputedStyle(container, null);
  var containerWidth = Number(containerComputedStyle.getPropertyValue('width', null).split('px')[0]);
  var containerVerticalMargin = Number(containerComputedStyle.getPropertyValue('margin-top').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('margin-bottom').split('px')[0]);
  //var containerHorizontalMargin = Number(containerComputedStyle.getPropertyValue('margin-left').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('margin-right').split('px')[0]);
  var containerVerticalPadding = Number(containerComputedStyle.getPropertyValue('padding-top').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('padding-bottom').split('px')[0]);
  var containerHorizontalPadding = Number(containerComputedStyle.getPropertyValue('padding-left').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('padding-right').split('px')[0]);
  var containerVerticalBorderWidth = Number(containerComputedStyle.getPropertyValue('border-top-width').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('border-bottom-width').split('px')[0]);
  var containerHorizontalBorderWidth = Number(containerComputedStyle.getPropertyValue('border-left-width').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('border-right-width').split('px')[0]);
  // container.style.height = (windowHeight - headerHeight - footerHeight) +'px';

  calculateFittedContainerHeight(function (result) {
    container.style.height = result;
  });
  calculateHorizonalMiddleAlignContainerMargin(function (result) {
    container.style.marginLeft = result;
  });

  function calculateFittedContainerHeight (callback) {
    var result = (windowHeight - headerHeight - headerBorderWidth - footerHeight - footerBorderWidth - containerVerticalMargin - containerVerticalPadding - containerVerticalBorderWidth) +'px';
    callback(result);
  }
  function calculateHorizonalMiddleAlignContainerMargin (callback) {
    var result = (windowWidth - containerWidth - containerHorizontalPadding - containerHorizontalBorderWidth)/2 + 'px';
    callback(result);
  }



  var motherboard_left_side = document.getElementById('motherboard_left_side');
  var motherboard_middle_side = document.getElementById('motherboard_middle_side');
  var motherboard_right_side = document.getElementById('motherboard_right_side');
  calculateFittedInnerBoxHeight('motherboard_container', ['motherboard_top'], 'motherboard_left_side', function (result) {
    motherboard_left_side.style.height = result +'px';
    motherboard_middle_side.style.height = result +'px';
    motherboard_right_side.style.height = result +'px';
  });

  function calculateFittedInnerBoxHeight (outterBoxId, siblingBoxIdArr, ownId, callback) {
    var outterBox = null;
    var outterBoxTotalHeight = 0;
    var siblingBoxTotalHeight = 0;
    var own = null;
    var ownComputedStyle = null;
    var ownVerticalPadding = 0;
    var ownVerticalBorderThickness = 0;
    var ownVerticalMargin = 0;
    var calculatedOwnHeight = 0;
    outterBox = document.getElementById(outterBoxId);
    outterBoxTotalHeight = Number(window.getComputedStyle(outterBox, null).getPropertyValue('height').split('px')[0]);
    for (var i = 0; i < siblingBoxIdArr.length; i++) {
      var siblingBox = document.getElementById(siblingBoxIdArr[i]);
      var siblingBoxComputedStyle = window.getComputedStyle(siblingBox, null);
      var siblingBoxHeight = Number(siblingBoxComputedStyle.getPropertyValue('height').split('px')[0]);
      var siblingBoxVerticalPadding = Number(siblingBoxComputedStyle.getPropertyValue('padding-top').split('px')[0]) + Number(siblingBoxComputedStyle.getPropertyValue('padding-bottom').split('px')[0]);
      var siblingBoxVerticalBorderThickness = Number(siblingBoxComputedStyle.getPropertyValue('border-top').split('px')[0]) + Number(siblingBoxComputedStyle.getPropertyValue('border-bottom').split('px')[0]);
      var siblingBoxVerticalMargin = Number(siblingBoxComputedStyle.getPropertyValue('margin-top').split('px')[0]) + Number(siblingBoxComputedStyle.getPropertyValue('margin-bottom').split('px')[0]);
      siblingBoxTotalHeight += siblingBoxHeight + siblingBoxVerticalPadding + siblingBoxVerticalBorderThickness + siblingBoxVerticalMargin;
    }
    own = document.getElementById(ownId);
    ownComputedStyle = window.getComputedStyle(own, null);
    ownVerticalPadding = Number(ownComputedStyle.getPropertyValue('padding-top').split('px')[0]) + Number(ownComputedStyle.getPropertyValue('padding-bottom').split('px')[0]);
    ownVerticalBorderThickness = Number(ownComputedStyle.getPropertyValue('border-top').split('px')[0]) + Number(ownComputedStyle.getPropertyValue('border-bottom').split('px')[0]);
    ownVerticalMargin = Number(ownComputedStyle.getPropertyValue('margin-top').split('px')[0]) + Number(ownComputedStyle.getPropertyValue('margin-bottom').split('px')[0]);

    calculatedOwnHeight = outterBoxTotalHeight - siblingBoxTotalHeight - (ownVerticalPadding + ownVerticalBorderThickness + ownVerticalMargin);
    callback(calculatedOwnHeight);
  }
}

window.onresize = function () {
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var headerTag = document.getElementById('header');
  var headerComputedStyle = window.getComputedStyle(headerTag, null);
  var headerHeight = Number(headerComputedStyle.getPropertyValue('height').split('px')[0]);
  var headerBorderWidth = Number(headerComputedStyle.getPropertyValue('border-bottom-width').split('px')[0]);
  var footerTag = document.getElementById('footer');
  var footerComputedStyle = window.getComputedStyle(footerTag, null);
  var footerHeight = Number(footerComputedStyle.getPropertyValue('height').split('px')[0]);
  var footerBorderWidth = Number(footerComputedStyle.getPropertyValue('border-bottom-width').split('px')[0]);
  
  var container = document.getElementById('motherboard_container');
  var containerComputedStyle = window.getComputedStyle(container, null);
  var containerWidth = Number(containerComputedStyle.getPropertyValue('width', null).split('px')[0]);
  var containerVerticalMargin = Number(containerComputedStyle.getPropertyValue('margin-top').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('margin-bottom').split('px')[0]);
  //var containerHorizontalMargin = Number(containerComputedStyle.getPropertyValue('margin-left').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('margin-right').split('px')[0]);
  var containerVerticalPadding = Number(containerComputedStyle.getPropertyValue('padding-top').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('padding-bottom').split('px')[0]);
  var containerHorizontalPadding = Number(containerComputedStyle.getPropertyValue('padding-left').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('padding-right').split('px')[0]);
  var containerVerticalBorderWidth = Number(containerComputedStyle.getPropertyValue('border-top-width').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('border-bottom-width').split('px')[0]);
  var containerHorizontalBorderWidth = Number(containerComputedStyle.getPropertyValue('border-left-width').split('px')[0]) + Number(containerComputedStyle.getPropertyValue('border-right-width').split('px')[0]);
  // container.style.height = (windowHeight - headerHeight - footerHeight) +'px';

  calculateFittedContainerHeight(function (result) {
    container.style.height = result;
  });
  calculateHorizonalMiddleAlignContainerMargin(function (result) {
    container.style.marginLeft = result;
  });

  function calculateFittedContainerHeight (callback) {
    var result = (windowHeight - headerHeight - headerBorderWidth - footerHeight - footerBorderWidth - containerVerticalMargin - containerVerticalPadding - containerVerticalBorderWidth) +'px';
    callback(result);
  }
  function calculateHorizonalMiddleAlignContainerMargin (callback) {
    var result = (windowWidth - containerWidth - containerHorizontalPadding - containerHorizontalBorderWidth)/2 + 'px';
    callback(result);
  }
} 

window.onclick = function (event) {
  var userBox = document.getElementById('user_box');
  var sectionContentContainer = document.getElementById('section_content_container');
  if (!event.target.matches('#user_gate') && (userBox.class = 'hidden')) {
    userBox.classList.add('hidden');
  }
  if (!event.target.matches('.video_preview_iframe') && !event.target.matches('.video_thumbnails_play_button')) {
    var videoPriviewIframeArr = document.getElementsByClassName('video_preview_iframe');
    for (var i = 0; i < videoPriviewIframeArr.length; i++) {
      sectionContentContainer.removeChild(videoPriviewIframeArr[i]);
    }
  }
}