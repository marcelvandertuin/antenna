var socket = io.connect();
let notify = false;
let mute = false;
			
function sanitizeMessageInput(data) {
	var data = 
	data.replace(/<script[^>]*?>.*?<\/script>/gi, '')
	.replace(/<[\/\!]*?[^<>]*?>/gi, '')
	.replace(/<style[^>]*?>.*?<\/style>/gi, '')
	.replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');		
	return data;	
}

function detectImage(username, message, pm, id, speech) {
	let urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
	let result = urlRegex.test(message);
	let img = false, lnk = false, txt = false, vid = false, url = false, title = false;
	if( result) {
		let last_four = message.substr(message.length - 4);
		let last_five = message.substr(message.length - 5);
		if( last_four === '.jpg' || last_four === '.gif' || last_four === '.png' || last_five === '.jpeg') {	
			img = true;
			displayDataInput(username, message, pm, id, speech, img, lnk, txt, vid, url, title);		
		}else{		
			lnk = true;
			detectVideo(username, message, pm, id, speech, img, lnk, txt, vid, url, title);		
		}
	}else{		
		txt = true;
		displayDataInput(username, message, pm, id, speech, img, lnk, txt, vid, url, title);	
	}
}

function detectVideo(username, message, pm, id, speech, img, lnk, txt, vid, url, title) {
	let videoRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	let result = videoRegex.test(message);
	if( result) {
		vid = true;	
		getVideoUrl(username, message, pm, id, speech, img, lnk, txt, vid, url, title);	
	}else{
		displayDataInput(username, message, pm, id, speech, img, lnk, txt, vid, url, title);
	}		
}

function getVideoUrl(username, message, pm, id, speech, img, lnk, txt, vid, url, title) {
	let videoUrlRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	let match = message.match(videoUrlRegex);
	if( match && match[7].length == 11){
		let id = match[7];
		let url = 'https://www.youtube.com/watch?v=' + id;
		$.getJSON('https://noembed.com/embed', {
			format: 'json', url: url
		}, function(data) {
			url = match[7];
			title = data.title;
			displayDataInput(username, message, pm, id, speech, img, lnk, txt, vid, url, title);
		});	
	}	
}

function displayDataInput(username, message, pm, id, speech, img, lnk, txt, vid, url, title) {
	let target = '';
	pm ? target = '#pm_chat_scroll_'+id : target = '.om_chat_scroll';
	if( txt){
		$(target).append('<section class="msg" id="normal"><a href="#" class="userlink">' + username + '</a> ' + message + '</section>');
		if( !notify && !mute){
			speech ? speechSynthesis.speak(new SpeechSynthesisUtterance(message)) : false;
		}
	}else if(img){
		$(target).append('<section class="msg" id="normal"><a href="#" class="userlink">' + username + '</a></section>');
		$(target).append('<section class="msg" id="normal"><img height="auto" width="100%" src="' + message + '" alt="' + message + '"></section>');				
	}else if(lnk && !vid){
		$(target).append('<section class="msg" id="normal"><a href="#" class="userlink">' + username + '</a> <a href="' + message + '"target="_blank">'+message+'</a></section>');		
	}else if(vid){
		$(target).append('<section class="msg" id="normal"><a href="#" class="userlink">' + username + '</a> <a href="' + message + ' " target="_blank">' + message + '</a></section>');
		$(target).append('<section class="thumbnail_vessel" id="' + url + '"><section class="thumbnail" class="msg" id="normal"><img src="http://img.youtube.com/vi/' + url + '/hqdefault.jpg" alt="' + title + '"></section><section class="thumbnail_title">' + title + '</section></section>');	
	}
	playAudioNotifyMsg('msg');
	$(target).scrollTop($(target)[0].scrollHeight);		
}

function playAudioNotifyMsg(type) {
	if( !notify && !mute){
		let audio_notify = '';
		if(type === 'msg'){
			audio_notify = $('#notify_msg');			
		}else if(type === 'enter'){
			audio_notify = $('#enter_msg');			
		}else if(type === 'leave'){
			audio_notify = $('#leave_msg');			
		}
		audio_notify.currentTime = 0;
		audio_notify[0].load();	
		audio_notify[0].play();	
	}	
}

// Name generator
$(document).ready(function() {
	let names = ['Guest', 'Star', 'Chupacabra', 'Merchant', 'Pilgrim', 'Stranger', 'Wrestler', 'Troll', 'Nemesis', 'Thief', 'Crazy', 'Warmonger', 'Person', 'Escapee', 'Deserter', 'Kid', 'Prisoner', 'Entity', 'Savage', 'Crook', 'Wanderer', 'Peasant', 'Hominoid', 'Maricoxi', 'Cyborg', 'Cyclops', 'Centaur', 'Minotaur'];
	let randomNumber = Math.floor(Math.random() * names.length);
	let randomName = names[randomNumber];
	let txt = '';
	let characters = 'abcdefghijklmnopxrstuvwxyz1230456789';
	for(let i = 0; i < 7; i++) {
		txt += characters.charAt(Math.floor(Math.random() * characters.length));	
		$('#nickname').val(randomName + txt);
	}
});

// Display timestamp
let interval = setInterval(function() {
	let lastmsg = $('.msg:last-child').prop('id');
	if( lastmsg !== 'time'){
		let date = new Date();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let ampm = hours >= 12 ? 'pm' : 'pm';
		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		let strTime = hours + ':' + minutes + ' ' + ampm;
		let day = date.getDay();
		if( day === 0){
			day = 'sunday';
		}else if(day === 1) {
			day = 'monday';
		}else if(day === 2) {
			day = 'tuesday';
		}else if(day === 3) {
			day = 'wednesday';
		}else if(day === 4) {
			day = 'thursday';
		}else if(day === 5) {
			day = 'friday';
		}else if(day === 6) {
			day = 'saturday';
		}
		let timestamp = 'Send at ' + strTime + ' on ' + day;
		$('.om_chat_scroll').append('<section class="msg" id="time">' + timestamp + ' </section>');
		$('.pm_chat_scroll').append('<section class="msg" id="time">' + timestamp + ' </section>');
		$('.om_chat_scroll').scrollTop($(".om_chat_scroll")[0].scrollHeight);
		if( $('.pm_chat_scroll').length != 0) {
			$('.pm_chat_scroll').scrollTop($(".om_chat_scroll")[0].scrollHeight);
		}
	}	
},300000);