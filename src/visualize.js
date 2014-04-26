  /*!
  * ----------------------
  * Keen IO Visualization
  * ----------------------
  */

  Keen.prototype.draw = function(query, selector, config) {
    return new Keen.Request(this, [query], function(){
      this.draw(selector, config);
    });
  };

  Keen.loaded = false;
  // Set false to bypass trigger
  // in src/outro.js
