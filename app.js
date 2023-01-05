// Init 
let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let mysql = require('mysql');

require('dotenv').config();

server.listen(process.env.VERCEL_URL || 8888);
console.log('Server is running!');

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile(process.env.VERCEL_URL + '/index.html');
});

// Connect database (Remove SSL on localhost/ local db)
let con = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	ssl: {
		rejectUnauthorized: true
	}
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Mysql database connected!");
});

// Get connected
io.on('connection', function (socket) {

	let sessionid = socket.id;
	let currentroom = socket.name;

	// Output rooms
	con.query('SELECT room, count(*) AS count FROM users GROUP BY room ORDER BY count(room) DESC', function (err, results) {
		if (err) throw err;
		io.emit('output_rooms', results);
	});

	// New user
	socket.on('input_new_user', function (room, username) {
		socket.name = room; socket.join(room);
		socket.to(room).emit('output_new_user', room, username);

		// Insert new user
		let time = convertTime();
		let data = { username: username, socket: socket.id, room: room, time: time[0], stamp: time[1] };
		con.query('INSERT INTO users SET ?', data, function (err, results) {
			if (err) throw err;
		});

		// Check moderator and update if needed
		con.query('SELECT * FROM users WHERE room = ?', [room], function (err, results) {
			if (err) throw err;
			if (results.length == 1) {
				con.query('UPDATE users SET moderator = 1 WHERE room = ?', [room], function (err, results) {
					if (err) throw err;
				});
			}
		});
	});

	// Input get all users
	socket.on('input_get_all_users', function () {
		con.query('SELECT room FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			con.query('SELECT * FROM users WHERE room = ?', [results[0].room], function (err, results) {
				if (err) throw err;
				io.to(results[0].room).emit('output_get_all_users', results);
			});
		});
	});

	// Change username
	socket.on('change_username_input', function (username) {

		// Get previous username
		con.query('SELECT username FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			let preusername = results[0].username;

			// Update database
			con.query('UPDATE users SET username = ? WHERE socket = ?', [username, sessionid], function (err, results) {
				if (err) throw err;
				io.emit('change_username_output', preusername, username, sessionid);
			});
		});
	});

	// Input message
	socket.on('input_message', function (message, pm, id, speech) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			let room = results[0].room;
			let username = results[0].username;
			let idSender = results[0].socket;
			if (pm) {
				io.to(sessionid).emit('output_pm_message_to_sender', username, message, pm, id, speech, sessionid);
				io.to(id).emit('output_pm_message_to_receiver', username, message, pm, id, speech, idSender);

			} else {
				// Check if user is blocked
				let userdata = '';
				getAllUserdata(function (result) {
					userdata = result;
					if (userdata[0].block == 0) {
						io.to(results[0].room).emit('output_message', username, message, pm, id, speech, sessionid);
					} else {
						let message = 'you are currently blocked';
						io.to(sessionid).emit('output_message_individual', message);
					}
				});
			}
		});
	});

	// Make user moderator
	socket.on('input_makemod_user', function (id) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			let moderator = results[0].username;
			con.query('UPDATE users SET moderator = 1, block = 0 WHERE socket = ?', [id], function (err, results) {
				if (err) throw err;
				con.query('SELECT * FROM users WHERE socket = ?', [id], function (err, results) {
					let username = results[0].username;
					let room = results[0].room;
					io.to(results[0].room).emit('output_makemod_user', moderator, username, id);
				});
			});
		});
	});

	// Block user
	socket.on('input_block_user', function (id) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			let moderator = results[0].username;
			con.query('UPDATE users SET block = 1 WHERE socket = ?', [id], function (err, results) {
				if (err) throw err;
				con.query('SELECT * FROM users WHERE socket = ?', [id], function (err, results) {
					let username = results[0].username;
					let room = results[0].room;
					io.to(results[0].room).emit('output_block_user', moderator, username, id);
				});
			});
		});
	});

	// Unblock user
	socket.on('input_unblock_user', function (id) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			let moderator = results[0].username;
			con.query('UPDATE users SET block = 0 WHERE socket = ?', [id], function (err, results) {
				if (err) throw err;
				con.query('SELECT * FROM users WHERE socket = ?', [id], function (err, results) {
					let username = results[0].username;
					let room = results[0].room;
					io.to(results[0].room).emit('output_unblock_user', moderator, username, id);
				});
			});
		});
	});

	// Input get profile
	socket.on('input_get_profile', function (id) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(sessionid).emit('output_get_profile', results[0].username);
		});
	});

	// Disconnected
	socket.on('disconnecting', function () {
		let username = '';
		let socket = '';
		let room = '';
		let mod = '';

		// Check if user entered a room
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			if (results.length) {
				username = results[0].username;
				socket = results[0].socket;
				room = results[0].room;
				mod = results[0].moderator;

				// Delete user
				con.query('DELETE FROM users WHERE socket = ?', [socket], function (err, results) {
					if (err) throw err;
					io.to(room).emit('output_disconnected_user', socket, username);
				});

				// Count number of users in room disconnected user
				con.query('SELECT COUNT(*) AS totalUsers FROM users WHERE room = ?', [room], function (err, results) {
					if (err) throw err;
					if (results[0].totalUsers != '0' && mod == '1') {

						// Count number of moderators in the room
						con.query('SELECT COUNT(*) AS totalMods FROM users WHERE room = ? AND moderator = ?', [room, 1], function (err, results) {
							if (err) throw err;
							if (results[0].totalMods == '0') {

								// Select the first not-mod-user from the users
								con.query('SELECT * FROM users WHERE room = ? ORDER BY time ASC LIMIT 1', [room], function (err, results) {
									if (err) throw err;
									let userMod = results[0].username;

									// Give first not-mod-user mod privileges
									con.query('UPDATE users SET moderator = 1 WHERE socket = ?', [results[0].socket], function (err, results) {
										if (err) throw err;
										io.to(room).emit('output_auto_moderatorprivileges', username, userMod);
									});
								});
							}
						});
					}
				});
			}
		});
	});

	function getAllUserdata(callback) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			userdata = results;
			return callback(results);
		});
	}

	function convertTime() {
		let date = new Date();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		let time = hours + ':' + minutes + ' ' + ampm;
		let stamp = date.getTime();
		return [time, stamp];
	}

	/* VIDEO CONTROL */

	// Player start
	socket.on('input_player_start', function (id) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			if (results[0].moderator) {
				io.to(results[0].room).emit('output_player_start', results[0].username, id);

				// Give all moderators video control
				con.query('SELECT * FROM users WHERE room = ?', [results[0].room], function (err, results) {
					for (let i = 0; i < results.length; i++) {
						io.to(results[i].socket).emit('output_videocontrol');
					}
				});

			} else if (results[0].block) {
				let message = 'you are currently blocked to start the video';
				io.to(sessionid).emit('output_message_individual', message);
			} else {
				let message = 'you have no moderator privileges to start a video';
				io.to(sessionid).emit('output_message_individual', message);
			}
		});
	});

	// Player stop
	socket.on('input_player_stop', function () {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(results[0].room).emit('output_player_stop', results[0].username);

			// Hide all moderators video control
			con.query('SELECT * FROM users WHERE room = ?', [results[0].room], function (err, results) {
				for (let i = 0; i < results.length; i++) {
					io.to(results[i].socket).emit('output_videocontrol');
				}
			});
		});
	});

	// Player unpause
	socket.on('input_player_unpause', function () {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(results[0].room).emit('output_player_unpause', results[0].username);
		});
	});

	// Player pause
	socket.on('input_player_pause', function () {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(results[0].room).emit('output_player_pause', results[0].username);
		});
	});

	// Player mute
	socket.on('input_player_mute', function () {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(results[0].room).emit('output_player_mute', results[0].username);
		});
	});

	// Player unmute
	socket.on('input_player_unmute', function () {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(results[0].room).emit('output_player_unmute', results[0].username);
		});
	});

	// Player volume
	socket.on('input_player_volume', function (val) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(results[0].room).emit('output_player_volume', results[0].username, val);
		});
	});

	// Player seek
	socket.on('input_player_seek', function (val) {
		con.query('SELECT * FROM users WHERE socket = ?', [sessionid], function (err, results) {
			if (err) throw err;
			io.to(results[0].room).emit('output_player_seek', results[0].username, val);
		});
	});

});