module.exports = {
  "extraction": parseExtraction
};

function parseExtraction(req){
  var data = (req.data instanceof Array ? req.data[0] : req.data),
  names = req.queries[0].get("property_names") || [],
  schema = { records: "result", select: true };

  if (names) {
    schema.select = [];
    _each(names, function(p){
      schema.select.push({ path: p });
    });
  }

  return new Dataset(data, schema);
}
