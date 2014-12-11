var getDatasetSchemas = require("../helpers/getDatasetSchemas"),
    getDefaultTitle = require("../helpers/getDefaultTitle"),
    getQueryDataType = require("../helpers/getQueryDataType");

var Dataset = require("../../dataset"),
    parseRawData = require("./parseRawData");

module.exports = function(req){
  var dataType = getQueryDataType(req.queries[0]);

  if (dataType === "extraction") {
    this.dataset = getDatasetSchemas.extraction(req);
  }
  else {
    this.parseRawData(req.data instanceof Array ? req.data[0] : req.data);
  }

  // Set dataType
  this.dataType(dataType);

  // Update the default title every time
  this.view.defaults.title = getDefaultTitle.call(this, req);

  // Update the active title if not set
  if (!this.title()) {
    this.title(this.view.defaults.title);
  }
  return this;
};
