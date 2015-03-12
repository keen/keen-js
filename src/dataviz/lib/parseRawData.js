var Dataviz = require('../dataviz'),
    Dataset = require('../../dataset');

var each = require('../../core/utils/each');

module.exports = function(raw){
  this.dataset = parseRawData.call(this, raw);
  return this;
};

function parseRawData(response){
  var self = this,
      schema = {},
      indexBy,
      delimeter,
      indexTarget,
      labelSet,
      labelMap,
      dataType,
      dataset;

  indexBy = self.indexBy() ? self.indexBy() : Dataviz.defaults.indexBy;
  delimeter = Dataset.defaults.delimeter;
  indexTarget = indexBy.split('.').join(delimeter);

  labelSet = self.labels() || null;
  labelMap = self.labelMapping() || null;

  // Metric
  // -------------------------------
  if (typeof response.result == 'number'){
    //return new Dataset(response, {
    dataType = 'singular';
    schema = {
      records: '',
      select: [{
        path: 'result',
        type: 'string',
        label: 'Metric'
      }]
    }
  }

  // Everything else
  // -------------------------------
  if (response.result instanceof Array && response.result.length > 0){

    // Interval w/ single value
    // -------------------------------
    if (response.result[0].timeframe && (typeof response.result[0].value == 'number' || response.result[0].value == null)) {
      dataType = 'chronological';
      schema = {
        records: 'result',
        select: [
          {
            path: indexTarget,
            type: 'date'
          },
          {
            path: 'value',
            type: 'number'
            // format: '10'
          }
        ]
      }
    }

    // Static GroupBy
    // -------------------------------
    if (typeof response.result[0].result == 'number'){
      dataType = 'categorical';
      schema = {
        records: 'result',
        select: []
      };
      for (var key in response.result[0]){
        if (response.result[0].hasOwnProperty(key) && key !== 'result'){
          schema.select.push({
            path: key,
            type: 'string'
          });
          break;
        }
      }
      schema.select.push({
        path: 'result',
        type: 'number'
      });
    }

    // Grouped Interval
    // -------------------------------
    if (response.result[0].value instanceof Array){
      dataType = 'cat-chronological';
      schema = {
        records: 'result',
        unpack: {
          index: {
            path: indexTarget,
            type: 'date'
          },
          value: {
            path: 'value -> result',
            type: 'number'
          }
        }
      }
      for (var key in response.result[0].value[0]){
        if (response.result[0].value[0].hasOwnProperty(key) && key !== 'result'){
          schema.unpack.label = {
            path: 'value -> ' + key,
            type: 'string'
          }
          break;
        }
      }
    }

    // Funnel
    // -------------------------------
    if (typeof response.result[0] == 'number'){
      dataType = 'cat-ordinal';
      schema = {
        records: '',
        unpack: {
          index: {
            path: 'steps -> event_collection',
            type: 'string'
          },
          value: {
            path: 'result -> ',
            type: 'number'
          }
        }
      }
    }

    // Select Unique
    // -------------------------------
    if (typeof response.result[0] == 'string'){
      dataType = 'nominal';
      dataset = new Dataset();
      dataset.appendColumn('unique values', []);
      each(response.result, function(result, i){
        dataset.appendRow(result);
      });
    }

    // Extraction
    // -------------------------------
    if (dataType === void 0) {
      dataType = 'extraction';
      schema = { records: 'result', select: true };
    }

  }

  dataset = dataset instanceof Dataset ? dataset : new Dataset(response, schema);

  // Set dataType
  if (dataType) {
    self.dataType(dataType);
  }

  return dataset;
}
