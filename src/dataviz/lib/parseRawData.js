var Dataset = require('../../dataset');
var extend = require('../../core/utils/extend');

module.exports = function(response){
  var dataType,
      indexBy = this.indexBy() ? this.indexBy() : 'timestamp.start',
      parser,
      parserArgs = [],
      query = (typeof response.query !== 'undefined') ? response.query : {};

  // Ensure all required params are present
  query = extend({
    analysis_type: null,
    event_collection: null,
    filters: [],
    group_by: null,
    interval: null,
    timeframe: null,
    timezone: null
  }, query);

  if (query.analysis_type === 'funnel') {
    dataType = 'cat-ordinal';
    parser = 'funnel';
  }
  else if (query.analysis_type === 'extraction'){
    dataType = 'extraction';
    parser = 'extraction';
  }
  else if (query.analysis_type === 'select_unique') {
    if (!query.group_by && !query.interval) {
      dataType = 'nominal';
      parser = 'list';
    }
    // else { Not supported }
  }
  else if (query.analysis_type) {
    if (!query.group_by && !query.interval) {
      dataType = 'singular';
      parser = 'metric';
    }
    else if (query.group_by && !query.interval) {
      if (typeof query.group_by === 'string') {
        dataType = 'categorical';
        parser = 'grouped-metric';
      }
      else {
        dataType = 'categorical';
        parser = 'double-grouped-metric';
        parserArgs.push(query.group_by);
      }
    }
    else if (query.interval && !query.group_by) {
      dataType = 'chronological';
      parser = 'interval';
      parserArgs.push(indexBy);
    }
    else if (query.group_by && query.interval) {
      if (typeof query.group_by === 'string') {
        dataType = 'cat-chronological';
        parser = 'grouped-interval';
        parserArgs.push(indexBy);
      }
      else {
        dataType = 'cat-chronological';
        parser = 'double-grouped-interval';
        parserArgs.push(query.group_by);
        parserArgs.push(indexBy);
      }
    }
  }

  if (!parser) {

    // Metric
    // -------------------------------
    if (typeof response.result === 'number'){
      dataType = 'singular';
      parser = 'metric';
    }

    // Everything else
    // -------------------------------
    if (response.result instanceof Array && response.result.length > 0){

      // Interval w/ single value
      // -------------------------------
      if (response.result[0].timeframe && (typeof response.result[0].value == 'number' || response.result[0].value == null)) {
        dataType = 'chronological';
        parser = 'interval';
        parserArgs.push(indexBy)
      }

      // Static GroupBy
      // -------------------------------
      if (typeof response.result[0].result == 'number'){
        dataType = 'categorical';
        parser = 'grouped-metric';
      }

      // Grouped Interval
      // -------------------------------
      if (response.result[0].value instanceof Array){
        dataType = 'cat-chronological';
        parser = 'grouped-interval';
        parserArgs.push(indexBy)
      }

      // Funnel
      // -------------------------------
      if (typeof response.result[0] == 'number' && typeof response.steps !== "undefined"){
        dataType = 'cat-ordinal';
        parser = 'funnel';
      }

      // Select Unique
      // -------------------------------
      if ((typeof response.result[0] == 'string' || typeof response.result[0] == 'number') && typeof response.steps === "undefined"){
        dataType = 'nominal';
        parser = 'list';
      }

      // Extraction
      // -------------------------------
      if (dataType === void 0) {
        dataType = 'extraction';
        parser = 'extraction';
      }
    }
  }

  if (dataType) {
    this.dataType(dataType);
  }

  this.dataset = Dataset.parser.apply(this, [parser].concat(parserArgs))(response);

  if (parser.indexOf('interval') > -1) {
    this.dataset.updateColumn(0, function(value, i){
      return new Date(value);
    });
  }
  return this;
  // Eg: Dataset.parser('double-grouped-interval', ['first', 'second'], 'timeframe.end');
};
