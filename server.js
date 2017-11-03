
var express = require('express');
var app = express();
var path = require('path');

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3002;

var Rooms = require('./controllers/rooms.js');
var Players = require('./controllers/players.js');
var Commands = require('./controllers/commands.js');

// boot server
console.log("");
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// route static site
app.use(express.static(path.join(__dirname, 'public')));

// setup the rooms controller
Rooms.setup(function () { });

io.on('connection', function (socket) {
  //steps of loggin in: name | playing
  socket.step = "name";
  var player;

  socket.emit('message', {
    message: "Type your name :"
  });

  socket.on('disconnect', function(reason) {
    Players.remove(player);
  });

  socket.on('message', function (message) {
    // use the step field we attached to the socket to see where they are
    //   along the login process
    if(socket.step == "name") {
      // either create a new character or load from file
      var command = Commands.parse(message);
      var loadedPlayer = Players.load(command.tokens[0]);
      if(loadedPlayer == false) {
        player = Players.createAndSpawn(socket, command.tokens[0]);
      } else {
        player = Players.spawn(socket, loadedPlayer);
      }
      socket.step ="playing";

    } else if(socket.step == "playing") {
      Commands.resolve(player, message);
    }
  });
});

// make up a weird name with a vowel in second place, this is placeholder for character
function randomName () {
  var base = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
  var vowels = ['a','e','i','o','u'];
  var innerVowel = vowels[parseInt(Math.random()*5)];
  var innerVowel2 = vowels[parseInt(Math.random()*5)];
  base = base[0].toUpperCase() + innerVowel +  base.substr(1,2) + innerVowel2;
  return base;
}
