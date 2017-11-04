var clone = require('safe-clone-deep');

var glob = require( 'glob' );
var path = require( 'path' );

var Items = function () {};

var items = [];


// auto startup on include
glob.sync( './items/*.js' ).forEach( function( file ) {
  var temp = require( path.resolve( file ) );
  items = items.concat(temp);
});


// take an array of slugs and replace them with real item objects
Items.prototype.replace = function (list) {
  var output = [];
  for(var i =0 ; i <list.length; i++) {
    var item = this._find(list[i]);
    if(item) {
      output.push(clone(item)); // clone items
    } else {
      console.log ("couldnt find item " + list[i].slug);
    }
  }
  return output;
}

Items.prototype.removeFromRoom = function (room, slug) {
	for(var i = 0; i< room.items.length; i++){
		if(this._match(room.items[i], slug)) {
      return room.items.splice(i, 1)[0];
		}
	}
  return false;
}


Items.prototype.removeFromPlayer = function (player, slug) {
	for(var i = 0; i< player.inventory.length; i++){
		if(this._match(player.inventory[i], slug)) {
      return player.inventory.splice(i, 1)[0];
		}
	}
  return false;
}

// this is how we determine if a string matched an item
// for now, it's an exact match on slug field, later it should be soft
// and use multiple fields
Items.prototype._match = function (item, text) {
  if(item.slug == text) {
    return true;
  }
  return false;
}

// find by slug name, e.g. "south-fountain"
Items.prototype._find = function (slug) {
  for(var i =0 ; i <items.length; i++) {
    if(items[i].slug == slug) {
      return items[i];
    }
  }
  return false;
}

module.exports = new Items();
