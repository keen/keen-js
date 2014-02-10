  /*! 
  * -----------------
  * Keen IO Query JS
  * -----------------
  */

  Keen.Query = function() {};
  Keen.Query.prototype = {
    configure: function(eventCollection, options) {
      this.eventCollection = eventCollection;
      this.options = options;
      return this;
    }
  };

  Keen.Count = function(eventCollection, options) {
    this.configure(eventCollection, options);
  };
  Keen.Count.prototype = new Keen.Query();


  // -------------------------------
  // Keen.query() Method
  // -------------------------------  

  Keen.prototype.query = function(query, success, error) {
    if ( query instanceof Keen ) {
      console.log('Keen Object!');
    
    } else if ( query instanceof Keen.Query ) {
      console.log('teh Query!', query);
    
    } else if ( Object.prototype.toString.call(query) === '[object String]' ) {
      console.log('Saved Query Name!');
    
    }
    return this;
  };


  // Private for Keen.Query Objects
  // --------------------------------

  function _getJSON(url, success, error) {
    if (this.client.capapble.xhr) {
      _sendXHR.apply(this, ["GET", url, null, null, this.client.readKey, success, error]);
    } else {
      _sendJSONP.apply(this, this.client.readKey, success, error);
    }
  };

  function _sendQuery(success, error) {
    // Keen.BaseQuery
  };

  function _getPath() {
    // builds a query path from arguments
  };

  function _getParams() {
    // builds a param string from arguments
  };

  function _getResponse(url, success, error) {
    // IS THIS THE SAME AS _getJSON??
    // Keen.BaseQuery.getResponse, 
    // Keen.getEventCollections,
    // Keen.getEventCollectionProperties 
  };
