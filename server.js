
var express = require('express');
var app = express();
var path = require('path');
var Rooms = require('./rooms.js');
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

  socket.player = {
    name: "rosa",
    class: "hugomancer",
    level:99,
    roomID : Rooms.getDefaultRoomID()
  };


  socket.on('message', function (message) {
    Commands.resolve(socket.player, message, function(text){
        socket.emit('message', {
          message: text
        });
      });
  });
});
