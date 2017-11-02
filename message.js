var Message = function () {};

Message.prototype.send = function (targets, text){
  // target can be single player or array
  if(typeof targets.length == "number"){
    // array
  } else {
    // pack it into an array
    targets = [targets];
  }

  for(var i =0; i < targets.length; i++){
    targets[i].socket.emit('message', {
      message: text
    });
  }
}

module.exports = new Message();
