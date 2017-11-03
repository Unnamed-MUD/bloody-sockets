var glob = require( 'glob' );
var path = require( 'path' );

var items = [];

var Items = function () {};

// auto startup on include
glob.sync( './items/*.js' ).forEach( function( file ) {
  var temp = require( path.resolve( file ) );
  items = items.concat(temp);
});


// take an array of slugs and replace them with real item objects
Items.prototype.replace = function (list) {
  var output = [];
  for(var i =0 ; i <list.length; i++) {
    var item = this.find(list[i]);
    if(item) {
      output.push(item);
    } else {
      console.log ("couldnt find item " + list[i].slug);
    }
  }
  return output;
}

// find by slug name, e.g. "south-fountain"
Items.prototype.find = function (slug) {
  for(var i =0 ; i <items.length; i++) {
    if(items[i].slug == slug) {
      return items[i];
    }
  }
  return false;
}

module.exports = new Items();
