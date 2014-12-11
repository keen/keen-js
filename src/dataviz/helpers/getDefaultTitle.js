module.exports = function(req){
  var analysis = req.queries[0].analysis.replace("_", " "),
  collection = req.queries[0].get('event_collection'),
  output;
  output = analysis.replace( /\b./g, function(a){
    return a.toUpperCase();
  });
  if (collection) {
    output += ' - ' + collection;
  }
  return output;
};
