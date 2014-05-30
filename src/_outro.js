
  // ----------------------
  // Utility Methods
  // ----------------------

  setTimeout(function(){
    Keen.domready(function(){
      Keen.trigger('ready');
    });
  }, 0);

  return Keen;
});
