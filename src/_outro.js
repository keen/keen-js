
  // ----------------------
  // Utility Methods
  // ----------------------

  if (Keen.loaded) {
    setTimeout(function(){
      Keen.utils.domready(function(){
        Keen.trigger('ready');
      });
    }, 0);
  }

  return Keen;
});
