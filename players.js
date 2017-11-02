var Players = function () {
};

// total list
var list = [];

Players.prototype.add = function (player) {
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

Players.prototype.remove = function (player){
  for(var i = 0; i <  list.length; i++) {
    if(list[i].socket.id == player.socket.id) {
      console.log('- player ' + player.name);
      list.splice(i, 1);
      return;
    }
  }

  // we never found them
  console.log('TRIED TO REMOVE PLAYER NO IN LIST ');
  console.dir(player);

}

Players.prototype.findAllInRoom = function (roomID) {
  var result = [];
  for(var i = 0; i < list.length; i++) {
    if(list[i].roomID == roomID) {
      result.push(list[i]);
    }
  }
  return result;
}

Players.prototype.findOthersInRoom = function (roomID, player) {
  var results = this.findAllInRoom(roomID);
  return this._not(results, player);
}

Players.prototype.all = function () {
  return list;
}

Players.prototype._not = function (players, exlcudedPlayer) {
  var results = []
  for(var i = 0; i < players.length; i++){
    if(players[i].socket.id != exlcudedPlayer.socket.id) {
      results.push(players[i]);
    }
  }
  return results;
}

module.exports = new Players();
