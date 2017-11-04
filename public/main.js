

$(function( ){
  var socket = io();

  socket.on('message', function (data) {
    print(data.message);
  });


  $('form').on('submit', function (e) {
    var input = $('[name=chat]').val(); // get value from box
    print('<br><div class="echo">> ' + input + '</div>'); // local echo
    socket.emit('message', input); // send it to our server
    $('[name=chat]').val(''); // clear input field

    e.preventDefault();// make sure we dont accidentally submit
    return false;
  });

  function print(myString) {
    var $textarea = $('#log');

    // handle hilight parsing
    myString = myString.replace("[", '<span class="hilight-item">');
    myString = myString.replace("]", '</span>');

    myString = myString.replace("{", '<span class="hilight-title">');
    myString = myString.replace("}", '</span>');

    $textarea.append("<div>"+myString + "</div>");
    $textarea.scrollTop($textarea[0].scrollHeight - $textarea.height());
  }
});
