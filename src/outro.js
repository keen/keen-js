
  // ----------------------
  // Utility Methods
  // ----------------------

  setTimeout(function(){
    if (Keen.loaded) {
      Keen.trigger("ready");
    }
  }, 0);

  return Keen;
});
