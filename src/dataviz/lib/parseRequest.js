var getDefaultTitle = require('../helpers/getDefaultTitle'),
    getQueryDataType = require('../helpers/getQueryDataType'),
    parseRawData = require('./parseRawData'),
    Query = require('../../core/query');

module.exports = function(req){
  var dataType;
  if (req.queries[0] instanceof Query) {
    dataType = getQueryDataType(req.queries[0]);
    this.dataType(dataType);
    // Update the default title every time
    this.view.defaults.title = getDefaultTitle.call(this, req);
    // Update the active title if not set
    if (!this.title()) {
      this.title(this.view.defaults.title);
    }
  }

  parseRawData.call(this, req.data instanceof Array ? req.data[0] : req.data);
  return this;
};
