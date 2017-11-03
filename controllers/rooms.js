var MongoClient = require('mongodb').MongoClient;
var Items = require('./items');

function loadFromDB(callback) {
	MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
		if(err) { return console.dir(err); }
		console.log("Connected to mongo");
		var collection = db.collection('rooms');

		collection.find().toArray(function(err, rooms) {
      callback(rooms);
			console.log("Found " + rooms.length + " rooms");
		});
	});
};

var Rooms = function () {
  this.rooms = [];
};

// boot up call
Rooms.prototype.setup = function (callback) {
  this._load(callback);
}

// if we need to recall or spawn somewhere safe
Rooms.prototype.getDefaultRoomID = function (){
  return this.rooms[0].id;
}

// fake for now
Rooms.prototype.getRecallRoomID = function (){
	return this.rooms[0].id;
}

// for a given cmd, eg "east", see if a room has that exit
// if so, we pass back the linked room's ID, or false
Rooms.prototype.findExitID = function(room,exitName) {
	for(var i = 0; i < room.exits.length; i++) {
		if(room.exits[i].cmd == exitName){
			return room.exits[i].room;
		}
	}
	return false;
}

// get room object
Rooms.prototype.findRoomByID = function (roomID) {
  for(var i = 0; i < this.rooms.length; i++) {
    if(this.rooms[i].id == roomID) {
      return this.rooms[i];
    }
  }
  return false;
}

// list all rooms
Rooms.prototype.all = function() {
	return this.rooms;
}

// actual parsing from database
Rooms.prototype._load = function (callback) {
  var self = this;
  loadFromDB (function (rooms) {
    rooms.forEach(function(room) {
      room.id = room._id.toString();
			room.items = Items.replace(room.items);
    });
    self.rooms = rooms;

    callback();
  });
}

module.exports = new Rooms();
