var MongoClient = require('mongodb').MongoClient;

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

Rooms.prototype.setup = function (callback) {
  this.load(callback);
}

Rooms.prototype.getDefaultRoomID = function (){
  return this.rooms[0].id;
}
Rooms.prototype.findExitID = function(room,exitName) {
	for(var i = 0; i < room.exits.length; i++) {
		if(room.exits[i].cmd == exitName){
			return room.exits[i].room;
		}
	}
	return false;
}
Rooms.prototype.findRoom = function (roomID) {
  for(var i = 0; i < this.rooms.length; i++) {
    if(this.rooms[i].id == roomID) {
      return this.rooms[i];
    }
  }
  return false;
}
Rooms.prototype.all = function() {
	return this.rooms;
}

Rooms.prototype.load = function (callback) {
  var self = this;
  loadFromDB (function (rooms) {
    rooms.forEach(function(room) {
      room.id = room._id.toString();
    });
    self.rooms = rooms;

    callback();
  });
}

module.exports = new Rooms();
