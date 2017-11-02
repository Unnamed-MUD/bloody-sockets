var Commands = function (){};
var Rooms = require('./rooms');
var Players = require('./players');
var Message = require('./message');

Commands.prototype.resolve = function (player, fullCommand) {
    if(fullCommand.length == 0) {
        return Message.send(player, "You didnt type anything...");
    }
    
    // if we find the command just by name
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
    var currentRoom = Rooms.findRoom(player.roomID);
    var nextRoomID = Rooms.findExitID(currentRoom,command.tokens[0]);
    if(nextRoomID) {
        player.roomID = nextRoomID;
        var others = Players.findOthersInRoom(player.roomID, player);
        Message.send(others, player.name + " has arrived");
        return;
    }
    
    if(this.all[command.tokens[0]]) {
        this.all[command.tokens[0]](player, command);
    } else {
        Message.send(player, "There's no command called '" + command.tokens[0] +"'");
    }
    
};

// full list of all commands
Commands.prototype.all = {};

// single token command, 'look'
Commands.prototype.all.look = function (player, command) {
    var room = Rooms.findRoom(player.roomID);
    if(room) {
        Message.send(player, room.content);
        if(room.exits.length > 0){
            var exitList = "";
            room.exits.forEach(function(exit) {
                exitList += exit.cmd+ " ";
            });
            Message.send(player, "Exits: " + exitList);
        } else {
            Message.send(player, "Exits: none");
        }
    } else {
        Message.send(player, "Can't find any room... where are you???");
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
        if (Rooms.findRoom(command.tokens[2])) {
            //Success!
            player.roomID = command.tokens[2];
            var others = Players.findOthersInRoom(player.roomID, player);
            return Message.send(others,player.name + " appeared in a cloud of smoke! *poof*")
            
            
        }else {
            return Message.send(player,"Room does not exist");
        }
        
    }
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

Commands.prototype.all.help = function (player, command) {
    Message.send(player, "Commands: " + Object.keys(Commands.prototype.all).join(", "));
}

module.exports = new Commands ();
