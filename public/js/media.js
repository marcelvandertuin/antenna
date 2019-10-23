// Initiate player
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let player;

function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '540',
		width: '960',
		suggestedQuality:'hd720',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	event.target.setVolume(75);
	event.target.getCurrentTime();
}

let done = false;
function onPlayerStateChange(event) {
	let state = player.getPlayerState();
	if( state === 1) {
		let timeVideo = player.getDuration();
		mytimer = setInterval(function() {
			timeElapsed = player.getCurrentTime();
			currentTime = ( timeElapsed / timeVideo ) * 100;
				if(currentTime > 100) {
					$('#player_seek').slider('value', 0);
				}else{
					$('#player_seek').slider('value', currentTime);
				}
		}, 100);
	}
	if( event.data == YT.PlayerState.ENDED && !done) {
		done = true;
		$('.media_vessel').hide();
	}
	function onPlayerStateChange(event) {
		if(event.data == YT.PlayerState.PLAYING) {
		
		}
	}
}

// Input start player
$(document).ready(function() {
	$('body').on('click', '.thumbnail_vessel', function(e) {
		e.preventDefault();
		let id = $(this).prop('id');
		socket.emit('input_player_start', id);
	});
});

// Output start player
$(document).ready(function() {
	socket.on('output_player_start', function(username, id) {
		done = false;
		player.loadVideoById(id, 0);
		player.playVideo();
		$('.media_vessel').show();
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' started a video</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);					
	});	
});

// Output control player
$(document).ready(function() {
	socket.on('output_videocontrol', function(username, id) {
		if($('.player_control_vessel').is(':visible')) {
			$(this).hide();
		}else{		
			$(this).show();
		}
	});				
});

// Input (un)pause player
$(document).ready(function() {
	$('body').on('click', 'section#settings_pauseplayer_btn', function(e) {
		e.preventDefault();
		let state = player.getPlayerState();
		if( state === 1){
			socket.emit('input_player_pause');
			$('h1#settings_title').text('Pauze');
		}else{
			socket.emit('input_player_unpause');
			$('h1#settings_title').text('Play');
		}
	});
});

// Hover (un)pause player
$(document).ready(function() {
	$('section#settings_pauseplayer_btn').on({
		mouseenter: function () {
			$('h1#settings_title').text('(Un)pause video');
			$('section#settings_pauseplayer_btn').css('background-color', '#E2FCEF');
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#settings_pauseplayer_btn').css('background-color', '#540D6E');
		}
	});
});

// Output pause player
$(document).ready(function() {
	socket.on('output_player_pause', function(username, id) {
		player.pauseVideo();
		$('#player').show();
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' paused the video</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);						
	});
});

// Output unpause player
$(document).ready(function() {
	socket.on('output_player_unpause', function(username, id) {
		player.playVideo();
		$('#player').show();
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' unpaused the video</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);					
	});	
});

// Input (un)mute player	
$(document).ready(function() {
	$('body').on('click', 'section#settings_muteplayer_btn', function(e) {
		e.preventDefault();
		if( player.isMuted() === true){
			socket.emit('input_player_unmute');
			$('h1#settings_title').text('Unmute');
		}else{
			socket.emit('input_player_mute');	
			$('h1#settings_title').text('Mute');			
		}
	});
});

// Hover (un)mute player
$(document).ready(function() {
	$('section#settings_muteplayer_btn').on({
		mouseenter: function () {
			$('h1#settings_title').text('(Un)mute video');
			$('section#settings_muteplayer_btn').css('background-color', '#E2FCEF');
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#settings_muteplayer_btn').css('background-color', '#540D6E');
		}
	});
});

// Output mute player
$(document).ready(function() {
	socket.on('output_player_mute', function(username, id) {
		player.mute();
		$('#player').show();
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' muted the video</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight); 		
	});
});

// Output unmute player
$(document).ready(function() {
	socket.on('output_player_unmute', function(username, id) {
		player.unMute();
		$('#player').show();
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' unmuted the video</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);				
	});

});

// Input volume player
$(document).ready(function() {	
	$("#player_volume").slider({
		orientation: "vertical",
		value : 75,
		step  : 1,
		range : 'min',
		min   : 0,
		max   : 100,
		slide: function(event, ui) {
			let val = $('#player_volume').slider("option", "value");
			$('h1#settings_title').text('Volume (' + val + ')');
			socket.emit('input_player_volume', val);			
		}
	});
});

// Hover volume player
$(document).ready(function() {
	$('section#player_volume').on({
		mouseenter: function () {
			$('h1#settings_title').text('Volume video');
			$('section#player_volume').find('class').css('background-color', '#E2FCEF');			
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#player_volume').find('class').css('background-color', '#540D6E');
		}
	});
});

// Output volume player
$(document).ready(function() {
	socket.on('output_player_volume', function(username, val) {
		player.setVolume(val);
		let lastmsg = $('.msg:last-child').prop('id');
		if( lastmsg !== 'vol'){
			$('.om_chat_scroll').append('<section class="msg" id="vol">' + username + ' changed the volume of the video</section>');
			$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);
		}
	});
});

// Input seek player	
$(document).ready(function() {	
	$("#player_seek").slider({
		orientation: "vertical",
		value : 100 - 0,
		step  : 0.01,
		range : 'min',
		min   : 0,
		max   : 100,
		slide: function(event, ui) {
			let timeVideo = player.getDuration();
			let seekTo 	  = (ui.value * timeVideo) / 100;	
			player.seekTo(seekTo, true);
			player.playVideo();
			$('h1#settings_title').text('Seek (' + Math.floor((seekTo / 60) * 100) / 100 + ')');
			socket.emit('input_player_seek', seekTo);
		}
	});	
});

// Hover seek player
$(document).ready(function() {
	$('section#player_seek').on({
		mouseenter: function () {
			$('h1#settings_title').text('Seek video');
			$('section#player_seek').find('class').css('background-color', '#E2FCEF');			
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#player_seek').find('class').css('background-color', '#540D6E');
		}
	});
});
	
// Output seek player
$(document).ready(function() {		
	socket.on('output_player_seek', function(username, seekTo) {
		player.seekTo(seekTo, true);
		player.playVideo();
		let lastmsg = $('.msg:last-child').prop('id');
		if( lastmsg !== 'seek'){
			$('.om_chat_scroll').append('<section class="msg" id="seek">' + username + ' changed the time of the video</section>');
			$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);
		}
	});
});	

// Input stop player
$(document).ready(function() {
	$('body').on('click', 'section#settings_stopplayer_btn', function(e) {
		e.preventDefault();
		socket.emit('input_player_stop');
		$('h1#settings_title').text('Stop');
	});
});

// Hover stop player
$(document).ready(function() {
	$('section#settings_stopplayer_btn').on({
		mouseenter: function () {
			$('h1#settings_title').text('Stop video');
			$('section#settings_stopplayer_btn').css('background-color', '#E2FCEF');
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#settings_stopplayer_btn').css('background-color', '#540D6E');
		}
	});
});

// Output stop player
$(document).ready(function() {
	socket.on('output_player_stop', function(username) {
		player.stopVideo();
		$('.media_vessel').hide();
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' ended the video</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);					
	});	
});
