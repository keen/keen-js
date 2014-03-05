  /*! 
  * ---------------------
  * Keen IO Visualize JS
  * ---------------------
  */

  Keen.prototype.draw = function(query, selector, options) {
    if ( query instanceof Keen ) {
      console.log('Keen Object!');

    } else if ( query instanceof Keen.Count ) {
      console.log('Let\'s Chart a Query!');

    } else if ( Object.prototype.toString.call(query) === '[object String]' ) {
      console.log('Saved Query Name!');

    } else if ( Object.prototype.toString.call(query) === '[object Array]' ) {
      console.log('Array of data objects!');

    } else if ( Object.prototype.toString.call(query) === '[object Object]' ) {
      console.log('Data object!');

    }
  };
