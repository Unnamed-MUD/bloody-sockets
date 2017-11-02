
var express = require('express');
var app = express();
var path = require('path');
var Rooms = require('./rooms.js');
var Players = require('./players.js');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3002;
var Commands = require('./commands.js');

console.log("");
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

// just load up the rooms from the DB
Rooms.setup(function () { });

io.on('connection', function (socket) {
  socket.emit('message', {
    message: "You've connected"
  });

  // player character with all stats + socket
  var player = {
    socket: socket,
    // random string name
    name: randomName(),
    class: "hugomancer",
    level:99,
    roomID : Rooms.getDefaultRoomID()
  };

  Players.add(player);

  socket.on('disconnect', function(reason) {
    Players.remove(player);
  });

  socket.on('message', function (message) {
    Commands.resolve(player, message, function(text){
        socket.emit('message', {
          message: text
        });
      });
  });
});


// make up a weird name with a vowel in second place
function randomName () {
  var base = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
  var vowels = ['a','e','i','o','u'];
  var innerVowel = vowels[parseInt(Math.random()*5)];
  base = base[0].toUpperCase() + innerVowel +  base.substr(1,4);
  return base;
}
