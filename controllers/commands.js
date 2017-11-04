var Commands = function (){};
var Rooms = require('./rooms');
var Players = require('./players');
var Message = require('./message');
var Items = require('./items');

Commands.prototype.resolve = function (player, fullCommand) {
    if(fullCommand.length == 0) {
        return Message.send(player, "You didnt type anything...");
    }

    var command = this.parse(fullCommand);

    // if we find the command just by first token in Commands.all
    if(this.all[command.tokens[0]]) {
        return this.all[command.tokens[0]](player, command);
    }

    // check if first token matches a room exit word
    var currentRoom = Rooms.findRoomByID(player.roomID);
    var nextRoomID = Rooms.findExitID(currentRoom,command.tokens[0]);
    if(nextRoomID) {
        return this.all._move(player, nextRoomID);
    }

    // fail case, no matching command or room exit
    Message.send(player, "There's no command called '" + command.tokens[0] +"'");
};

// split the command out into useful versions
Commands.prototype.parse = function (fullCommand) {
  var command = {
      full: "", // full text
      tokens: [], // every, word, space, seperated, array
      body: ""  // everything after the first word as a string
  };

  command.full = fullCommand.toLowerCase().trim();
  command.tokens = command.full.split(" ");

  var bodyPieces = fullCommand.trim().split(/ (.+)/);
  if(bodyPieces.length > 1) {
      command.body = bodyPieces[1];
  }
  return command;
}

// full list of all commands
Commands.prototype.all = {};

// single token command, 'look'
Commands.prototype.all.look = function (player, command) {
    var room = Rooms.findRoomByID(player.roomID);
    if(!room) {
      return Message.send(player, "Can't find any room... where are you???");
    }

    Message.send(player, "{"+room.title+"}");
    Message.send(player, room.content);

    var exitList = "none";
    if(room.exits.length > 0){
        exitList = room.exits.map(e => e.cmd).join(", ");
    }
    Message.send(player, "Exits: " + exitList);

    if(room.items.length > 0){
        var itemList = room.items.map(e => e.name).join(", ");
        Message.send(player, "Items: " + itemList);
    }

}
Commands.prototype.all.dev = function(player,command) {
    if (command.tokens.length < 2) {
        return Message.send(player,"Dev requires more than one arguement");
    }
    if (command.tokens[1] == "rooms") {
        var currentRooms = Rooms.all();
        Message.send(player,"Rooms: ");
        for (var i = 0; i < currentRooms.length; i++) {
            Message.send(player,currentRooms[i].title + " id: " + currentRooms[i].id);
        }
        return;
    }
    if (command.tokens[1] == "teleport") {
        if (command.tokens.length < 3) {
            return Message.send(player,"teleport requires 3 arguements");
        }
        if (Rooms.findRoomByID(command.tokens[2])) {
            //Success!
            player.roomID = command.tokens[2];
            var others = Players.findOthersInRoom(player.roomID, player);
            return Message.send(others,player.name + " appeared in a cloud of smoke! *poof*")


        }else {
            return Message.send(player,"Room does not exist");
        }

    }
}

// this must be externally validated !
//
Commands.prototype.all._move = function (player, newRoomID) {
  var othersLeaving = Players.findOthersInRoom(player.roomID, player);
  Message.send(othersLeaving, player.name + " has left");
  player.roomID = newRoomID;
  var othersEntering = Players.findOthersInRoom(player.roomID, player);
  Message.send(othersEntering, player.name + " has entered the room");
}

Commands.prototype.all.save = function (player) {
  Players.save(player); // save happens async
  Message.send(player, "Your adventure has been recorded");
}

// example of a two token command, 'sleep x'
Commands.prototype.all.sleep = function (player, command) {
    if(command.tokens.length < 2) {
        Message.send(player, "sleep for how long?");
    } else {
        var others = Players.findOthersInRoom(player.roomID, player);
        Message.send(others, player.name + " goes to sleep");
        Message.send(player, "You sleep for " + command.tokens[1] + " microseconds");
    }
}

Commands.prototype.all.who = function (player, command) {
    var current = Players.all();
    Message.send(player, current.length + " players currently logged in:");
    for(var i = 0; i< current.length; i++) {
        if(current[i].socket.id == player.socket.id) {
            Message.send(player, " - " + current[i].name + " [YOU]");
        } else {
            Message.send(player, " - " +  current[i].name);
        }
    }
}

Commands.prototype.all.say = function (player, command) {
    // get list of other ppl in room (exluding player)
    var others = Players.findOthersInRoom(player.roomID, player);
    Message.send(others, player.name + " says '" + command.body + "'");
    Message.send(player, "You say '" + command.body + "'");
}

Commands.prototype.all.inv = function (player, command){
  Message.send(player, player.inventory.length + " items: " + player.inventory.map(e => e.name).join(", "));
}

Commands.prototype.all.help = function (player, command) {
  var public = [];
  // hide any commands starting with _
  Object.keys(Commands.prototype.all).forEach(function(k){
    if(k[0] != '_'){
      public.push(k);
    }
  });
  Message.send(player, "Commands: " + public.join(", "));
}

Commands.prototype.all.get = function (player, command) {
  var room = Rooms.findRoomByID(player.roomID);
  var slug = command.tokens[1];
  Players.getItemFromRoom(player, room, slug);
}

Commands.prototype.all.drop = function (player, command) {
  var room = Rooms.findRoomByID(player.roomID);
  var slug = command.tokens[1];
  Players.dropItem(player, room, slug);
}

module.exports = new Commands ();
