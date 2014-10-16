module.exports = function(){
  return {

    libraryBanner: '!function(name, context, definition){' +
        'if (typeof define == "function" && define.amd) {' +
          'define("keen", [], function(lib){ return definition(); });' +
        '}' +
        'if ( typeof module === "object" && typeof module.exports === "object" ) {' +
          'module.exports = definition();' +
        '} else {' +
          'context[name] = definition();' +
        '}' +
      '}("Keen", this, function(Keen) {' +
        '"use strict";\n\n',

    libraryFooter: 'if (Keen.loaded) {' +
        'setTimeout(function(){' +
          'Keen.utils.domready(function(){' +
            'Keen.trigger("ready");' +
          '});' +
        '}, 0);' +
      '}' +
      '_loadAsync();' +
      '\n\nreturn Keen; \n\n});',

    adapterBanner: '!function(name, context, definition){' +
        'if (typeof define == "function" && define.amd) {' +
          'define(["keen"], function(lib){ definition(lib); });' +
        '}' +
        'if ( typeof module === "object" && typeof module.exports === "object" ) {' +
          'module.exports = definition();' +
        '} else {' +
          'definition(context[name]);' +
        '}' +
      '}("Keen", this, function(Keen) {' +
        '"use strict";\n\n',

    adapterFooter: '\n\nreturn Keen; \n\n});'

  }
};
