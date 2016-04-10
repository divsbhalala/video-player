// Sample Media Player using HTML5's Media API
// 
// Ian Devlin (c) 2012
// http://iandevlin.com
// http://twitter.com/iandevlin
//
// This was written as part of an article for the February 2013 edition of .net magazine (http://netmagazine.com/)

// Wait for the DOM to be loaded before initialising the media player
document.addEventListener("DOMContentLoaded", function() { initialiseMediaPlayer(); }, false);
window.addEventListener('load', function() {
    var video = document.querySelector('#media-video');
    //var preloader = document.querySelector('.preloader');

    function checkLoad() {
        if (video.readyState === 4) {
        	jQuery('#media-controls .overlay').remove();
        	jQuery('#tt-dr').text(convert_time(video.duration));
        } else {
            setTimeout(checkLoad, 100);
        }
    }

    checkLoad();
}, false);

// Variables to store handles to various required elements
var mediaPlayer;
var playPauseBtn;
var muteBtn;
var progressBar;
var media_controller=jQuery('#media-controls');
var play_list=new Array();
var play_list_cnt=0;
var config='';
function initialiseMediaPlayer() {
	// Get a handle to the player
	mediaPlayer = document.getElementById('media-video');
	
	// Get handles to each of the buttons and required elements
	playPauseBtn = document.getElementById('play-pause-button');
	muteBtn = document.getElementById('mute-button');
	progressBar = document.getElementById('progress-bar');
	jQuery('#media-controls').append('<div class="overlay"></div>');
	// Hide the browser's default controls
	mediaPlayer.controls = false;
	mediaPlayer.volume=0;
	// Add a listener for the timeupdate event so we can update the progress bar
	mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
	
	// Add a listener for the play and pause events so the buttons state can be updated
	mediaPlayer.addEventListener('play', function() {
		// Change the button to be a pause button
		changeButtonType(playPauseBtn, 'pause');
	}, false);
	mediaPlayer.addEventListener('pause', function() {
		// Change the button to be a play button
		changeButtonType(playPauseBtn, 'play');
	}, false);
	
	// need to work on this one more...how to know it's muted?
	mediaPlayer.addEventListener('volumechange', function(e) { 
		// Update the button to be mute/unmute
		if (mediaPlayer.muted) changeButtonType(muteBtn, 'unmute');
		else changeButtonType(muteBtn, 'mute');
	}, false);	
	mediaPlayer.addEventListener('ended', function() { this.pause(); }, false);	
	jQuery('#replay-button').hide();
	jQuery('#play-pause-button').show();
	if($('#media-controls').data('config')){config=($('#media-controls').data('config'));}
	makeList();
}

function togglePlayPause() {
	// If the mediaPlayer is currently paused or has ended
	if (mediaPlayer.paused || mediaPlayer.ended) {
		// Change the button to be a pause button
		changeButtonType(playPauseBtn, 'pause');
		// Play the media
		mediaPlayer.play();
	}
	// Otherwise it must currently be playing
	else {
		// Change the button to be a play button
		changeButtonType(playPauseBtn, 'play');
		// Pause the media
		mediaPlayer.pause();
	}
}

// Stop the current media from playing, and return it to the start position
function stopPlayer() {
	mediaPlayer.pause();
	mediaPlayer.currentTime = 0;
}

// Changes the volume on the media player
function changeVolume(direction) {
	if (direction === '+') mediaPlayer.volume += mediaPlayer.volume == 1 ? 0 : 0.1;
	else mediaPlayer.volume -= (mediaPlayer.volume == 0 ? 0 : 0.1);
	mediaPlayer.volume = parseFloat(mediaPlayer.volume).toFixed(1);
}

// Toggles the media player's mute and unmute status
function toggleMute() {
	if (mediaPlayer.muted) {
		// Change the cutton to be a mute button
		changeButtonType(muteBtn, 'mute');
		// Unmute the media player
		mediaPlayer.muted = false;
	}
	else {
		// Change the button to be an unmute button
		changeButtonType(muteBtn, 'unmute');
		// Mute the media player
		mediaPlayer.muted = true;
	}
}

// Replays the media currently loaded in the player
function replayMedia() {
	resetPlayer();
	mediaPlayer.play();
	jQuery('#replay-button').hide();
	jQuery('#play-pause-button').show();
}

// Update the progress bar
function updateProgressBar() {
	jQuery('#cr-dr').text(convert_time(mediaPlayer.currentTime));
	// Work out how much of the media has played via the duration and currentTime parameters
	var percentage = Math.floor((100 / mediaPlayer.duration) * mediaPlayer.currentTime);
	// Update the progress bar's value
	progressBar.value = percentage;
	// Update the progress bar's text (for browsers that don't support the progress element)
	progressBar.innerHTML = percentage + '% played';
	if(percentage===100){jQuery('#replay-button').show();jQuery('#play-pause-button').hide();}
}

// Updates a button's title, innerHTML and CSS class to a certain value
function changeButtonType(btn, value) {
	btn.title = value;
	btn.innerHTML = value;
	btn.className = value;
}

// Loads a video item into the media player
function loadVideo() {
	for (var i = 0; i < arguments.length; i++) {
		var file = arguments[i].split('.');
		var ext = file[file.length - 1];
		// Check if this media can be played
		if (canPlayVideo(ext)) {
			// Reset the player, change the source file and load it
			resetPlayer();
			mediaPlayer.src = arguments[i];
			mediaPlayer.load();
			break;
		}
	}
}

// Checks if the browser can play this particular type of file or not
function canPlayVideo(ext) {
	var ableToPlay = mediaPlayer.canPlayType('video/' + ext);
	if (ableToPlay == '') return false;
	else return true;
}

// Resets the media player
function resetPlayer() {
	// Reset the progress bar to 0
	progressBar.value = 0;
	// Move the media back to the start
	mediaPlayer.currentTime = 0;
	jQuery('#tt-dr').text(convert_time(mediaPlayer.duration));
	// Ensure that the play pause button is set as 'play'
	changeButtonType(playPauseBtn, 'play');
}

// Create video player list
function makeList(){
	if(jQuery('#media-play-list').length){
		if(jQuery('#media-controls button#play-next').length<=0 && config.nextBtn=="true"){
			jQuery('#media-controls button#play-next').remove();
			jQuery('#media-controls .ctl-bottom .ctl-left  #play-pause-button').after("<button id='play-next' class='' title='next' onclick='playNext();'>Next</button>");
		}
		if(jQuery('#media-controls button#play-prev').length<=0 && config.prevBtn=="true" && play_list_cnt ){
			jQuery('#media-controls button#play-prev').remove();
			jQuery('#media-controls .ctl-bottom .ctl-left  #play-pause-button').before("<button id='play-prev' class='' title='prevous' onclick='playPrev();'>Prev</button>");
		}
		jQuery('#media-play-list li').each(function(){
			play_list.push($(this).text())
		})
		jQuery('#media-play-list').remove();
	}
}

//play next video
function playNext(){
	if(play_list_cnt<play_list.length){
			mediaPlayer.src=play_list[play_list_cnt];
			play_list_cnt++;
			replayMedia();
			if(play_list_cnt==play_list.length){
				jQuery('#media-controls button#play-next').hide();
			}
			else{
				jQuery('#media-controls button#play-prev').remove();
				jQuery('#media-controls .ctl-bottom .ctl-left  #play-replay-button').before("<button id='play-prev' class='' title='prevous' onclick='playPrev();'>Prev</button>");
			}			
	}
}
function playPrev(){
	if(play_list_cnt>play_list.length){
			play_list_cnt--;
			mediaPlayer.src=play_list[play_list_cnt];
			replayMedia();
			if(play_list_cnt==play_list.length){
				jQuery('#media-controls button#play-next').hide();
			}
			else{
				jQuery('#media-controls button#play-prev').remove();
				jQuery('#media-controls .ctl-bottom .ctl-left  #play-pause-button').before("<button id='play-prev' class='' title='prevous' onclick='playPrev();'>Prev</button>");
			}			
	}

}

//full screen
function toggle_screen(){
	var mediaPlayer = document.getElementById('media-video');    
	mediaPlayer.webkitRequestFullScreen();

}
jQuery(document).on('click','.full-screen', launchIntoFullscreen );

jQuery(document).on('click','.small-screen',launchIntoExitscreen);
function launchIntoFullscreen() {
	mediaPlayer1=mediaPlayer;
  if(mediaPlayer1.requestFullscreen) {
    mediaPlayer1.requestFullscreen();
  } else if(mediaPlayer1.mozRequestFullScreen) {
    mediaPlayer1.mozRequestFullScreen();
  } else if(mediaPlayer1.webkitRequestFullscreen) {
    mediaPlayer1.webkitRequestFullscreen();
  } else if(mediaPlayer1.msRequestFullscreen) {
    mediaPlayer1.msRequestFullscreen();
  }
  media_controller.addClass('full-screen-parent');
  jQuery('.full-screen').addClass('small-screen');
  jQuery('.full-screen').removeClass('full-screen');
}
function launchIntoExitscreen() {
  if(mediaPlayer1.exitFullscreen) {
    mediaPlayer1.exitFullscreen();
  }else if(mediaPlayer1.mozExitFullScreen) {
    mediaPlayer1.mozExitFullScreen();
  } else if(mediaPlayer1.webkitExitFullScreen) {
    mediaPlayer1.webkitExitFullScreen();
  } else if(mediaPlayer1.msExitFullscreen) {
    mediaPlayer1.msExitFullscreen();
  }
  jQuery('.small-screen').addClass('full-screen');
  media_controller.removeClass('full-screen-parent');
  jQuery('.small-screen').removeClass('small-screen');
}
/*vol hover*/
document.getElementById('volume-ctl').addEventListener('mouseenter',tooglevoice);
document.getElementById('volume-ctl').addEventListener('mouseleave',tooglevoice);
function tooglevoice(){
	$("#volume").toggle();
}
$("#volume").slider({
    min: 0,
    max: 100,
    value: 100,
		range: "min",
		animate: true,
    slide: function(event, ui) {
    	mediaPlayer.volume=ui.value/100;
     // setVolume((ui.value) / 100);
    }
  });


//convert to time
function convert_time(seconds){
	seconds=Math.floor(seconds);
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(seconds / 3600);
	if(seconds<=9){seconds='0'+seconds}
	if(minutes<=9){minutes='0'+minutes}
	if(hours>0){return hours+':'+minutes+':'+seconds;}else{return minutes+':'+seconds;}
	
}