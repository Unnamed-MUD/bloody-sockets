

$(function( ){
  var socket = io();

  socket.on('message', function (data) {
    print(data.message);
  });


  $('form').on('submit', function (e) {
    var input = $('[name=chat]').val(); // get value from box
    print("\n> " + input); // local echo
    socket.emit('message', input); // send it to our server
    $('[name=chat]').val(''); // clear input field

    e.preventDefault();// make sure we dont accidentally submit
    return false;
  });

  function print(myString) {
    var $textarea = $('textarea');
    $textarea.append(myString + "\n");
    $textarea.scrollTop($textarea[0].scrollHeight - $textarea.height());
  }
});
