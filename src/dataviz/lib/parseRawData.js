Keen.Dataviz.prototype.parseRawData = function(raw){
  this.dataset = _parseRawData.call(this, raw);
  return this;
};

function _parseRawData(response){
  var self = this,
      schema = {},
      orderBy,
      delimeter,
      indexTarget,
      labelSet,
      labelMap,
      dataType,
      dataset;

  orderBy = self.orderBy() ? self.orderBy() : Keen.Dataviz.defaults.orderBy;
  delimeter = Keen.Dataset.defaults.delimeter;
  indexTarget = orderBy.split(".").join(delimeter);

  labelSet = self.labels() || null;
  labelMap = self.labelMapping() || null;

  // Metric
  // -------------------------------
  if (typeof response.result == "number"){
    //return new Keen.Dataset(response, {
    dataType = "singular";
    schema = {
      records: "",
      select: [{
        path: "result",
        type: "string",
        label: "Metric",
        format: false,
        method: "Keen.utils.prettyNumber",
        replace: {
          null: 0
        }
      }]
    }
  }

  // Everything else
  // -------------------------------
  if (response.result instanceof Array && response.result.length > 0){

    // Interval w/ single value
    // -------------------------------
    if (response.result[0].timeframe && (typeof response.result[0].value == "number" || response.result[0].value == null)) {
      dataType = "chronological";
      schema = {
        records: "result",
        select: [
          {
            path: indexTarget,
            type: "date"
          },
          {
            path: "value",
            type: "number",
            format: "10"
            // ,
            // replace: {
            //   null: 0
            // }
          }
        ]
      }
    }

    // Static GroupBy
    // -------------------------------
    if (typeof response.result[0].result == "number"){
      dataType = "categorical";
      schema = {
        records: "result",
        select: []
      };
      for (var key in response.result[0]){
        if (response.result[0].hasOwnProperty(key) && key !== "result"){
          schema.select.push({
            path: key,
            type: "string"
          });
          break;
        }
      }
      schema.select.push({
        path: "result",
        type: "number"
      });
    }

    // Grouped Interval
    // -------------------------------
    if (response.result[0].value instanceof Array){
      dataType = "cat-chronological";
      schema = {
        records: "result",
        unpack: {
          index: {
            path: indexTarget,
            type: "date"
          },
          value: {
            path: "value -> result",
            type: "number"
            // ,
            // replace: {
            //   null: 0
            // }
          }
        }
      }
      for (var key in response.result[0].value[0]){
        if (response.result[0].value[0].hasOwnProperty(key) && key !== "result"){
          schema.unpack.label = {
            path: "value -> " + key,
            type: "string"
          }
          break;
        }
      }
    }

    // Funnel
    // -------------------------------
    if (typeof response.result[0] == "number"){
      dataType = "cat-ordinal";
      schema = {
      records: "",
        unpack: {
          index: {
            path: "steps -> event_collection",
            type: "string"
          },
          value: {
            path: "result -> ",
            type: "number"
          }
        }
      }
    }

  }

  // Key-value label mapping
  // _runLabelMapping.call(this);
  // if (labelMap) {
  //   if (schema.unpack) {
  //     if (schema.unpack['index']) {
  //       schema.unpack['index'].replace = labelMap;
  //     }
  //     if (schema.unpack['label']) {
  //       schema.unpack['label'].replace = labelMap;
  //     }
  //   }
  //   if (schema.select) {
  //     _each(schema.select, function(v, i){
  //       schema.select[i].replace = labelMap;
  //     });
  //   }
  // }

  dataset = new Keen.Dataset(response, schema);

  // Post-process label replacement
  _runLabelReplacement.call(this);

  this.dataType(dataType);
  return dataset;
}
