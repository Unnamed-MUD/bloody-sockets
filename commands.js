var Commands = function (){};
var Rooms = require('./rooms');

Commands.prototype.resolve = function (player, fullCommand, callback) {
  // if we find the command just by name
  var commandTokens = trimAndSplit(fullCommand);

  if(commandTokens.length == 0) {
    callback("You didnt type anything...");
  }

  if(this.all[commandTokens[0]]) {
    this.all[commandTokens[0]](player, commandTokens, callback);
  } else {
    callback("There's no command called '" + commandTokens[0] +"'");
  }

};

// clean up and split into an array of strings
function trimAndSplit (fullCommand) {
  return fullCommand.toLowerCase().trim().split(" ");
}

// full list of all commands
Commands.prototype.all = {};

// single token command, 'look'
Commands.prototype.all.look = function (player, tokens, callback) {
  var room = Rooms.findRoom(player.roomID);
  if(room) {
    callback(room.content);
  } else {
    callback("Can't see any room... where are you?");
  }

}

// example of a two token command, 'sleep x'
Commands.prototype.all.sleep = function (player, tokens, callback) {
  if(tokens.length < 2) {
    callback("sleep for how long?");
  } else {
    callback("You sleep for " + tokens[1] + " microseconds");
  }
}

module.exports = new Commands ();
