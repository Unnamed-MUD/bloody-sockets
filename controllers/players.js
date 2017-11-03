var fs = require('fs');

var playerTemplate = require('../templates/player.json');
var Rooms = require('./rooms');
var Items = require('./items');
var Message = require("./message");

var Players = function () {
};
// total list
var list = [];



// given a player object, add them to the list of logged in players
Players.prototype.spawn = function (socket, player) {
  player.socket = socket;
  this._add(player);
  Message.send(player, "Logged in as " + player.name);
  return player;
}

// given a new player, make them a template and put the in the list
Players.prototype.createAndSpawn = function (socket, name) {
  var player = {};
  Object.assign(player, playerTemplate);

  player.name = name;
  player.socket = socket;
  player.roomID = Rooms.getDefaultRoomID();

  this.save(player);
  this._add(player);
  Message.send(player, "Created player " + player.name);
  return player;
}

// add player to playing list
Players.prototype._add = function (player) {
  for(var i = 0; i <  list.length; i++) {
    if(list[i].socket.id == player.socket.id) {
      console.log("TRIED TO ADD PLAYER TWICE");
      console.dir(player);
      return;
    }
  }

  list.push(player);
  console.log('+ player ' + player.name );
}

// remove player from playing list
Players.prototype.remove = function (player){
  for(var i = 0; i <  list.length; i++) {
    if(list[i].socket.id == player.socket.id) {
      console.log('- player ' + player.name);
      list.splice(i, 1);
      return;
    }
  }

  // we never found them
  console.log('TRIED TO REMOVE PLAYER NOT IN LIST ');
  console.dir(player);

}

// find every player in room
Players.prototype.findAllInRoom = function (roomID) {
  var result = [];
  for(var i = 0; i < list.length; i++) {
    if(list[i].roomID == roomID) {
      result.push(list[i]);
    }
  }
  return result;
}

// find all players EXCEPT given player in room
Players.prototype.findOthersInRoom = function (roomID, player) {
  var results = this.findAllInRoom(roomID);
  return this._not(results, player);
}

// list of all players
Players.prototype.all = function () {
  return list;
}

// returns array without given player
Players.prototype._not = function (players, exlcudedPlayer) {
  var results = []
  for(var i = 0; i < players.length; i++){
    if(players[i].socket.id != exlcudedPlayer.socket.id) {
      results.push(players[i]);
    }
  }
  return results;
}

// should return a player object or false
Players.prototype.load = function (playerName) {
  var filename = playerName+".json";
  var fullPath = __dirname+"/../saves/"+filename;
  if(!fs.existsSync(fullPath)) {
    // didnt find file
    return false;
  }
  var data = fs.readFileSync(fullPath, {encoding:"utf8"});
  var obj = JSON.parse(data);

  // inflate inventory slug array into rel objects
  obj.inventory = Items.replace(obj.inventory);
  
  return obj;
}

Players.prototype.getItemFromRoom = function (player, room, slug) {
  var item = Items.removeFromRoom(room, slug);
  if(item) {
    player.inventory.push(item);
  } else {
    Message.send(player, "No such item in room");
  }
}

// the big save function
Players.prototype.save = function (player) {
  var output = {};

  var keys = Object.keys(player);

  // save across ever field that appears also in the player template
  // this stops us from saving thigns like the socket or state variables like sleeping
  for (var i = 0; i < keys.length; i++) {
    if(typeof playerTemplate[keys[i]] != 'undefined') {
      output[keys[i]] = player[keys[i]];
    }
  }

  // make inventory into flat slugs
  output.inventory = output.inventory.map(a => a.slug);

  var outputString = JSON.stringify(output, null, '  '); // format json with indents

  var filename = player.name+".json";
  var fullPath = __dirname+"/../saves/"+filename;
  fs.writeFile(fullPath, outputString, function (err){
    if(err) {
      console.log("ERROR SAVING PLAYER");
      console.log(fullPath);
      console.dir(err);
      return;
    }
    console.log("saved player " + player.name);
  });
};

module.exports = new Players();
