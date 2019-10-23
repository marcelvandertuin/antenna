// Output rooms
socket.on('output_rooms', function(results) {
	$('.lobby_vessel ul').append('<li><h1>Active Rooms (' + results.length + ')</h1></li>');
	Object.keys(results).forEach(function(key) {
		let row = results[key];
		if( row.room && row.room.count !== null) {
			$('.lobby_vessel ul').append('<li><a href="#" class="roomlink" id="' + row.room + '">' + row.room + ' (' + row.count + ')</a></li>');
		}
	});
});

// Go to new room
$(document).ready(function() {
	$('body').on('keydown', 'input#room', function(e) {	
		let enter = e.which || e.keyCode || KeyboardEvent.key;
		if( enter == 13) {
			let room = $('#room').val();		
			let msg = [true];		
			if( room.indexOf(' ') !== -1) {
				msg = [false, 'enter room without spaces'];		
			}else if(room.length == 0) {
				msg = [false, 'enter room'];			
			}else if(room.length < 3) {
				msg = [false, 'minimal 6 alphanumeric characters'];			
			}else if(room.length > 20) {			
				msg = [false, 'maximal 20 alphanumeric characters'];	
			}
			if( !msg[0]) {
				$('.error_vessel').text('');
				$('.error_vessel').append(msg[1]);
			}else{
				room = sanitizeMessageInput(room);
				$('.lobby_grid').hide();
				$('.main_vessel').show();
				$('#message').focus();
				let username = $("#nickname").val();			
				socket.emit('input_new_user', room, username);	
				$('.om_chat_scroll').append('<section class="msg_welcome" id="normal"><strong>Welcome,</strong><a href="#" class="userlink"> ' + username + '</a></section>');
				$('.om_chat_scroll').scrollTop($(".om_chat_scroll")[0].scrollHeight);	
				playAudioNotifyMsg('enter');		
			}
		}
	});
});

// Go to existing room
$(document).ready(function() {
	$('body').on('click', 'a.roomlink', function(e) {
		let room = $(this).prop('id');
		let username = $("#nickname").val();
		socket.emit('input_new_user', room, username);			
		$('.lobby_grid').hide();
		$('.main_vessel').show();
		playAudioNotifyMsg('enter');
		$('.om_chat_scroll').append('<section class="msg_welcome" id="normal"><strong>Welcome,</strong><a href="#" class="userlink"> ' + username + '</a></section>');
		$('.om_chat_scroll').scrollTop($(".om_chat_scroll")[0].scrollHeight);			
	});
});

// Output new user
$(document).ready(function() {
	socket.on('output_new_user', function(room, username) {
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' has joined the room </section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);	
		playAudioNotifyMsg('enter');	
	});
});

// Room generator
$(document).ready(function() {
	let characters = 'abcdefghijklmnopxrstuvwxyz1230456789';
	let room = '';
	for(let i = 0; i < 11; i++)
		room += characters.charAt(Math.floor(Math.random() * characters.length)
	);
	$('#room').val(room);
});
