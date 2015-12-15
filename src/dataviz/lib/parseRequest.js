var Query = require('../../core/query');
var dataType = require('./dataType'),
    extend = require('../../core/utils/extend'),
    getDefaultTitle = require('../helpers/getDefaultTitle'),
    getQueryDataType = require('../helpers/getQueryDataType'),
    parseRawData = require('./parseRawData'),
    title = require('./title');

module.exports = function(req){
  var response = req.data instanceof Array ? req.data[0] : req.data;
  if (req.queries[0] instanceof Query) {

    // Include query body (Saved Query response structure)
    response.query = extend({
      analysis_type: req.queries[0].analysis
    }, req.queries[0].params);

    // Infer and set dataType
    dataType.call(this, getQueryDataType(req.queries[0]));
    // Update the default title every time
    this.view.defaults.title = getDefaultTitle.call(this, req);
    // Update the active title if not set
    if (!title.call(this)) {
      title.call(this, this.view.defaults.title);
    }
  }

  parseRawData.call(this, response);
  return this;
};
