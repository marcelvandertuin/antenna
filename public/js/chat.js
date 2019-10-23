// Interaction button one
$(document).ready(function() {
	$('body').on('click', 'a#btn_1', function(e) {
		e.preventDefault();
		if( $('.om_vessel').is(':visible')) { 
			$('.om_vessel').hide();	
			$(".settings_vessel").show();
		}else{
			$('.settings_vessel, .profile_vessel, .users_vessel, .pm_vessel').hide();
			$('.om_vessel').show();
		}
	});	
});

// Interaction button two
$(document).ready(function() {
	$('body').on('click', 'a#btn_2, a.userlink', function(e) {
		e.preventDefault();
		if( $('.om_vessel').is(':visible')) { 
		socket.emit('input_get_all_users');	
		$('.profile_vessel').html('');
			$('.om_vessel').hide();	
			$(".users_vessel").show();
		}else{
			$('.settings_vessel, .profile_vessel, .users_vessel, .pm_vessel').hide();
			$('.om_vessel').show();
		}
	});	
});

// Button notify
$(document).ready(function() {
	$('body').on('click', 'section#settings_notify_btn', function(e){
		e.preventDefault();
		if( notify){
			notify = false;
			$('h1#settings_title').text('Notify off');			
		}else{
			notify = true;
			$('h1#settings_title').text('Notify on');						
		}
	});	
});

// Hover button notify
$(document).ready(function() {
	$('section#settings_notify_btn').on({		
		mouseenter: function () {
			let msg = '';
			notify ? msg = 'Notify on' : msg = 'Notify off';
			$('h1#settings_title').text(msg);
			$('section#settings_notify_btn').css('background-color', '#E2FCEF');
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#settings_notify_btn').css('background-color', '#540D6E');
		}
	});
});

// Button mute
$(document).ready(function() {
	$('body').on('click', 'section#settings_mute_btn', function(e) {
		e.preventDefault();
		if( mute){
			mute = false;
			$('h1#settings_title').text('Unmute');			
		}else{
			mute = true;
			$('h1#settings_title').text('Mute');					
		}
	});	
});

// Hover button mute
$(document).ready(function() {
	$('section#settings_mute_btn').on({
		mouseenter: function () {
			$('h1#settings_title').text('(Un)mute audio');
			$('section#settings_mute_btn').css('background-color', '#E2FCEF');
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#settings_mute_btn').css('background-color', '#540D6E');
		}
	});
});

// Input all volume
$(document).ready(function() {	
	$("#all_volume").slider({
		orientation: "vertical",
		value : 100,
		step  : 1,
		range : 'min',
		min   : 0,
		max   : 100,
		slide: function(event, ui) {
			let val = $('#all_volume').slider("option", "value");
			player.setVolume(val);	
			let notifyMsg = document.getElementById("notify_msg");
			let notifyEnter = document.getElementById("enter_msg");
			let notifyLeave = document.getElementById("leave_msg");
			notifyMsg.volume = val / 100;
			notifyEnter.volume = val / 100;
			notifyLeave.volume = val / 100;
			$('h1#settings_title').text('Volume (' + val + ')');			
		}
	});
});

// Hover all volume
$(document).ready(function() {
	$('section#all_volume').on({
		mouseenter: function () {
			$('h1#settings_title').text('Volume audio');
			$('section#all_volume').find('class').css('background-color', '#E2FCEF');			
		},
		mouseleave: function () {
			$('h1#settings_title').text('Settings');
			$('section#all_volume').find('class').css('background-color', '#540D6E');
		}
	});
});

// Output users
$(document).ready(function() {
	socket.on('output_get_all_users', function(results) {
		$('.users_scroll').html('');
		$('.users_scroll').append('<ul></ul>');
		$('.users_scroll ul').append('<li><h1>Active Users (' + results.length + ')</h1></li>');
		Object.keys(results).forEach(function(key) {
			let row = results[key];
			if( row.moderator) {
				$('.users_scroll ul').append('	<li><a href="#" data-user="' + ['moderator', row.username, row.time, row.socket, row.moderator, row.block] + '" \
												class="userlink" id="' + row.socket + '"><span>M </span>' + row.username + '</a></li>');
			}else if(row.block) {
				$('.users_scroll ul').append('	<li><a href="#" data-user="' + ['blocked', row.username, row.time, row.socket, row.moderator, row.block] + '" \
												class="userlink" id="' + row.socket + '"><span>B </span>' + row.username + '</a></li>');
			}else{
				$('.users_scroll ul').append('	<li><a href="#" data-user="' + ['user', row.username, row.time, row.socket, row.moderator, row.block] + '" \
												class="userlink" id="' + row.socket + '">' + row.username + '</a></li>');
			}
		});
	});
});

// Interaction userlink 
$(document).ready(function() {
	$('body').on('click', 'a.userlink', function(e) {
		e.preventDefault();
		let id 		 = $(this).prop('id');	
		let data 	 = $('#' + id).data('user');
		let userdata = data.split(',');
		let pm 		 = '<section class="tab_btn_profile" data-user="' + [userdata[1], userdata[3]] + '" id="pm_' + userdata[3] + '"></section>';
		let makemod  = '';
		let block 	 = '';
		
		// Get current userdata
		let currentUser = $('#'+socket.id).data('user');
		let currentUserdata = currentUser.split(',');
		
		// User is current user
		if( currentUserdata[3] === userdata[3]) {
			pm = '', makemod  = '', block = '';	
			
		// Current user is moderator
		}else if(currentUserdata[4] === '1' && userdata[4] === '0') {
			makemod = '<section class="tab_btn_profile" id="mm_' + userdata[3] + '"></section>';	
			if(userdata[5] === '0') {
				block = '<section class="tab_btn_profile" id="bl_' + userdata[3] + '"></section>';	
			}else{
				block = '<section class="tab_btn_profile" id="ub_' + userdata[3] + '"></section>';	
			}			
		}else if(currentUserdata[4] === '1' && userdata[4] === '1') {
			makemod  = '', block = '';			
		}
		populateProfileVessel(id, userdata, pm, makemod, block);				
	});	
});

function populateProfileVessel(id, userdata, pm, makemod, block) {
	$('.profile_vessel').append(
		'<h1 id="profile_title">User</h1>\
			<section class="profile" id="profile_' + id + '">\
				<ul>\
					<li id="profile_title">\
						' + userdata[0] + '\
					</li>\
					<li id="profile_name">\
						' + userdata[1] + '\
					</li>\
					<li id="profile_time">\
						' + userdata[2] + '\
					</li>\
					<li id="profile_sendpm">\
						' + pm + '\
					</li>\
					<li id="profile_makemod_' + userdata[3] + '">\
						' + makemod + '\
					</li>\
					<li id="profile_block_' + userdata[3] + '">\
						' + block + '\
					</li>\
				</ul>\
			</section>');
		$('.settings_vessel, .user_vessel, .om_vessel, .pm_vessel').hide();
		$('.profile_vessel, #profile_' + id).show();	
}


// Interaction profile buttons
$(document).ready(function() {
	$('body').on('click', 'section.tab_btn_profile', function(e) {
		e.preventDefault();
		let preid = $(this).prop('id');
		let type  = preid.substring(0, 3);
		let id 	  = preid.slice(3);
		if( type == 'pm_'){
			let data 	 = $('#'+id).data('user');
			let userdata = data.split(',');
			let username = userdata[1];
			$('.settings_vessel, .user_vessel, .om_vessel, .profile_vessel, .full_pm_chat').hide();
			$('.pm_vessel').show();
			if( $('#full_pm_chat_'+id).length == 0) {
				createPmVessel(id, username);
			}else{
				$('#full_pm_chat_'+id).show();
			}
		}else if(type == 'mm_') {
			socket.emit('input_makemod_user', id);		
		}else if(type == 'bl_') {
			socket.emit('input_block_user', id);		
		}else if(type == 'ub_') {
			socket.emit('input_unblock_user', id);	
		}
	});	
});

function createPmVessel(id, username) {
	$('.pm_vessel').append(
		'<section class="full_pm_chat" id="full_pm_chat_' + id + '">\
			<section class="pm_title">private message</section>\
			<section class="pm_name">\
				' + username + '\
			</section>\
			<section class="pm_chat">\
				<section class="pm_chat_scroll" id="pm_chat_scroll_' + id + '">\
				</section>\
			</section>\
		</section>');
}

// Mouse enter profile buttons
$(document).ready(function() {
	$(document).on("mouseenter", "section.tab_btn_profile", function(e) {
		$(this).css('background-color', '#E2FCEF');
		let preid = $(this).prop('id');
		let action = '';			
		let type  = preid.substring(0, 3);
		if( type == 'pm_') {
			action = 'Private message';
		}else if(type == 'mm_') {
			action = 'Make moderator';
		}else if (type == 'bl_') {
			action = 'Block user';
		}else{
			action = 'Unblock user';			
		}
		$('h1#profile_title').text(action);		
	});
});

// Mouse leave profile buttons
$(document).ready(function() {
	$(document).on("mouseleave", "section.tab_btn_profile", function(e) {		
		$(this).css('background-color', '#540D6E');
		$('h1#profile_title').text('User');
	});
});

// Output make moderator user
$(document).ready(function() {
	socket.on('output_makemod_user', function(moderator, username, id) {
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + moderator + ' granted ' + username + ' moderator privileges</section>');	
		$('.profile_vessel, .users_vessel').hide();
		$('.om_vessel').show();	
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);
	});
});

// Output block user
$(document).ready(function() {
	socket.on('output_block_user', function(moderator, username, id) {
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + moderator + ' blocked ' + username + '</section>');	
		$('.profile_vessel, .users_vessel').hide();
		$('.om_vessel').show();
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);
	});
});
	
// Output unblock user
$(document).ready(function() {
	socket.on('output_unblock_user', function(moderator, username, id) {
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + moderator + ' unblocked ' + username + '</section>');	
		$('.profile_vessel, .users_vessel').hide();
		$('.om_vessel').show();
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);
	});
});

// Input change name
$(document).ready(function() {
	$('body').on('change', 'input#nickname', function(e) {
		let username = $(this).val();	
		let msg = [true];		
		if( username.indexOf(' ') !== -1) {
			msg = [false, 'enter username without spaces'];		
		}else if(username.length == 0) {
			msg = [false, 'enter username'];			
		}else if(username.length < 3){
			msg = [false, 'minimal 6 alphanumeric characters'];			
		}else if(username.length > 20) {			
			msg = [false, 'maximal 20 alphanumeric characters'];	
		}
		if( !msg[0]){
			$('.om_chat_scroll').append('<section class="msg" id="normal">' + msg[1] + '</section>');
			$('.om_chat_scroll').scrollTop($(".om_chat_scroll")[0].scrollHeight);	
			$('#nickname').val('');
		}else{
			username = sanitizeMessageInput(username);
			socket.emit('change_username_input', username);
		}		
	});
});

// Output name change
$(document).ready(function() {
	socket.on('change_username_output', function(preusername, username, id) {
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + preusername + ' changed name to ' + username + '</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);	
		if( $('#full_pm_chat_' + id).length != 0) {
			$(this).find('.pm_name').text(username);
			$('.pm_chat_scroll_' + id).append('<section class="msg" id="normal">' + preusername + ' changed name to ' + username + '</section>');
			$('.pm_chat_scroll_' + id).scrollTop($('.pm_chat_scroll_'+id)[0].scrollHeight);
		}
	});
});

// Message input
$(document).ready(function() {
	$('body').on('keydown', 'textarea#message', function(e) {
		let pm = false, id = false, speech = false;
		let enter = e.which || e.keyCode || KeyboardEvent.key;
		if( enter == 13 && !e.shiftKey) {
			let message = $(this).val();
			if( message.length !== 0) {
				message = sanitizeMessageInput(message);
				let first = message.charAt(0);
				let last  = message.charAt(1);
				if( first === '/' && last === 's'){
					message = message.substring(2);
					speech  = true;		
				}
				if( $('.full_pm_chat').is(':visible')) {
					id = $('.full_pm_chat').prop('id');
					id = id.slice(13);
					pm = true;		
				}
				socket.emit('input_message', message, pm, id, speech);
			}			
		}
	});
});

// Message output
$(document).ready(function() {
	socket.on('output_message', function(username, message, pm, id, speech, sessionid) {
		detectImage(username, message, pm, id, speech, sessionid);
		$('#message').val('');
		return false;	
	});
});

// Output message individualy
$(document).ready(function() {
	socket.on('output_message_individual', function(message) {
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + message + ' </section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);
	});
});

// Private message output to sender
$(document).ready(function() {
	socket.on('output_pm_message_to_sender', function(username, message, pm, id, speech) {
		detectImage(username, message, pm, id, speech);
		$('#message').val('');
		return false;	
	});
});

// Private message output to receiver
$(document).ready(function() {
	socket.on('output_pm_message_to_receiver', function(username, message, pm, id, speech, idSender) {
		if( !$('#full_pm_chat_' + idSender).length) {
			createPmVessel(idSender, username);	
		}
		if( !$('#full_pm_chat_' + idSender).is(':visible')) {
			$('.om_chat_scroll').append('<section class="msg" id="normal">' + username +  ' sent you a private message </section>');
			$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);				
		}
		detectImage(username, message, pm, idSender, speech);
		$('#message').val('');
		return false;	
	});
});

// Output disconnected user
$(document).ready(function() {
	socket.on('output_disconnected_user', function(id, username) {
		
		// Delete pm chat vessel 
		if( $('#full_pm_chat_' + id).length) {	
			if( $('#full_pm_chat_' + id).is(':visible') || $('#profile_' + id).is(':visible') || $('.users_vessel').is(':visible')) { 
				$('.settings_vessel, .profile_vessel, .users_vessel, .pm_vessel').hide();				
			}		
			$('#full_pm_chat_' + id).remove();
			$('.om_vessel').show();			
		}
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + username + ' has left the room</section>');
		playAudioNotifyMsg('leave');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);
	});
});

// Output automatic moderator privileges transfer
$(document).ready(function() {
	socket.on('output_auto_moderatorprivileges', function(disconnecteduser, username) {
		$('.om_chat_scroll').append('<section class="msg" id="normal">' + disconnecteduser + ' granted ' + username + ' moderator privileges</section>');
		$('.om_chat_scroll').scrollTop($('.om_chat_scroll')[0].scrollHeight);	
	});
});
