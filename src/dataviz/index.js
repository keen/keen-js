var extend = require("../core/utils/extend"),
    Dataviz = require("./dataviz");

extend(Dataviz.prototype, {
  "adapter"          : require("./lib/adapter"),
  "attributes"       : require("./lib/attributes"),
  "call"             : require("./lib/call"),
  "chartOptions"     : require("./lib/chartOptions"),
  "chartType"        : require("./lib/chartType"),
  "colorMapping"     : require("./lib/colorMapping"),
  "colors"           : require("./lib/colors"),
  "data"             : require("./lib/data"),
  "dataType"         : require("./lib/dataType"),
  "defaultChartType" : require("./lib/defaultChartType"),
  "el"               : require("./lib/el"),
  "height"           : require("./lib/height"),
  "indexBy"          : require("./lib/indexBy"),
  "labelMapping"     : require("./lib/labelMapping"),
  "labels"           : require("./lib/labels"),
  "library"          : require("./lib/library"),
  "parseRawData"     : require("./lib/parseRawData"),
  "parseRequest"     : require("./lib/parseRequest"),
  "prepare"          : require("./lib/prepare"),
  "sortGroups"       : require("./lib/sortGroups"),
  "sortIntervals"    : require("./lib/sortIntervals"),
  "title"            : require("./lib/title"),
  "width"            : require("./lib/width")
});

extend(Dataviz.prototype, {
  "destroy"          : require("./lib/actions/destroy"),
  "error"            : require("./lib/actions/error"),
  "initialize"       : require("./lib/actions/initialize"),
  "render"           : require("./lib/actions/render"),
  "update"           : require("./lib/actions/update")
});

module.exports = Dataviz;
