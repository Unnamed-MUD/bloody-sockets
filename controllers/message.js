var Message = function () {};

Message.prototype.send = function (targets, text){
  // target can be single player or array
  // if there's no length field, then pack our single target into an array
  if(typeof targets.length != "number"){
    targets = [targets];
  }

  for(var i =0; i < targets.length; i++){
    targets[i].socket.emit('message', {
      message: text
    });
  }
}


module.exports = new Message();
