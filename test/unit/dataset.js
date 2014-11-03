describe("Keen.Dataset", function(){

  beforeEach(function(){
    this.ds = new Keen.Dataset().parse({ result: 23456 }, {
      records: "",
      select: true
    });
  });
  afterEach(function(){
    this.ds = null;
  });

  describe("constructor", function(){
    it("should return a new Keen.Dataset instance", function(){
      expect(this.ds).to.be.an.instanceof(Keen.Dataset);
    });
    it("should have a schema hash with supplied properties", function(){
      expect(this.ds.schema()).to.deep.equal({ records: "", select: true });
    });
    it("should output the correct values", function(){
      expect(this.ds.output()).to.be.an("array")
        .and.to.be.of.length(2);
      expect(this.ds.output()[0][0]).to.eql("label");
      expect(this.ds.output()[0][1]).to.eql("value");
      expect(this.ds.output()[1][0]).to.eql("result");
      expect(this.ds.output()[1][1]).to.eql(23456);
    });
  });

  describe("#parse", function() {

    it("metric.json", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_metric, {
        records: "",
        select: true
      });

      expect(dataset.output())
        .to.be.an("array")
        .and.to.be.of.length(2);
      expect(dataset.output()[0][0]).to.eql("label");
      expect(dataset.output()[0][1]).to.eql("value");
      expect(dataset.output()[1][0]).to.eql("result");
      expect(dataset.output()[1][1]).to.eql(2450);
    });

    it("groupby.json", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_groupBy, {
        records: "result",
        select: true
      });
      expect(dataset.output()).to.be.an("array")
        .and.to.be.of.length(56);
      expect(dataset.output()[0]).to.be.of.length(2);
      expect(dataset.output()[0][0]).to.eql("page");
      expect(dataset.output()[0][1]).to.eql("result");
    });

    it("groupBy-boolean.json", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_groupBy_boolean, {
        records: "result",
        select: [
          {
            path: "switch",
            type: "string"
          },
          {
            path: "result",
            type: "number"
          }
        ]
      });
      dataset.sortRows("desc", dataset.sum, 1);
      expect(dataset.output()).to.be.an("array")
        .and.to.be.of.length(4);
      expect(dataset.output()[1][0]).to.eql("true");
      expect(dataset.output()[2][0]).to.eql("false");
    });

    it("interval-groupBy-empties.json", function(){
      var dataset = new Keen.Dataset()
      dataset.parse(data_interval_groupBy_empties, {
        records: "result",
        unpack: {
          index: {
            path: "timeframe -> start",
            type: "date"
          },
          value: {
            path: "value -> result",
            type: "number"
          },
          label: {
            path: "value -> parsed_user_agent.os.family",
            type: "string"
          }
        }
      });
      expect(dataset.output()).to.be.an("array")
        .and.to.be.of.length(7);
    });

    it("interval-groupBy-boolean.json", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_interval_groupBy_boolean, {
        records: "result",
        unpack: {
          index: {
            path: "timeframe -> start",
            type: "date"
          },
          value: {
            path: "value -> result",
            type: "number"
          },
          label: {
            path: "value -> key",
            type: "string"
          }
        }
      });
      expect(dataset.output()).to.be.an("array")
        .and.to.be.of.length(7);
    });

    it("interval-groupBy-nulls.json", function(){
      var dataset = new Keen.Dataset()
      dataset.parse(data_interval_groupBy_nulls, {
        records: "result",
        unpack: {
          index: {
            path: "timeframe -> start",
            type: "date"
          },
          value: {
            path: "value -> result",
            type: "number"
            , replace: { null: 0 }
          },
          label: {
            path: "value -> parsed_user_agent.os.family",
            type: "string"
            , replace: { null: "" }
            //format: "lowercase"
          }
        }
      });
      dataset.sortColumns("desc", dataset.sum, 1);
      dataset.sortRows("asc");

      expect(dataset.output()).to.be.an("array")
        .and.to.be.of.length(7);
      expect(dataset.output()[0]).to.be.of.length(3);
      expect(dataset.output()[0][0]).to.eql("start");
      expect(dataset.output()[0][1]).to.eql("");
      expect(dataset.output()[0][2]).to.eql("Windows Vista");
    });

    it("extraction.json 1", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_extraction, {
        records: "result",
        select: [
          {
            path: "keen -> timestamp",
            type: "date",
            label: "Time"
          },
          {
            path: "page",
            type: "string",
            label: "Page"
          },
          {
            path: "referrer",
            type: "string",
            label: "Referrer"
          }
        ]
      });

      expect(dataset.output())
        .to.be.an("array")
        .and.to.be.of.length(data_extraction.result.length+1);
      expect(dataset.output()[0]).to.be.of.length(3);
      expect(dataset.output()[0][0]).to.eql("Time");
      expect(dataset.output()[0][1]).to.eql("Page");
      expect(dataset.output()[0][2]).to.eql("Referrer");
    });

    it("extraction.json 2", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_extraction, {
        records: "result",
        select: [
          {
            path: "keen -> timestamp",
            type: "date"
          },
          {
            path: "page",
            type: "string"
          },
          {
            path: "referrer",
            type: "string",
            prefix: "@",
            suffix: "/mo"
          }
        ]
      });

      expect(dataset.output()).to.be.an("array")
        .and.to.be.of.length(data_extraction.result.length+1);
      expect(dataset.output()[0]).to.be.of.length(3);
      expect(dataset.output()[0][0]).to.eql("keen.timestamp");
      expect(dataset.output()[0][1]).to.eql("page");
      expect(dataset.output()[0][2]).to.eql("referrer");
    });


    it("extraction-uneven.json", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_extraction_uneven, {
        records: "result",
        select: [
          {
            path: "keen -> timestamp",
            type: "date"
          },
          {
            path: "page",
            type: "string"
          },
          {
            path: "key"
          }
        ]
      });
      expect(dataset.output())
        .to.be.an("array")
        .and.to.be.of.length(data_extraction_uneven.result.length+1);
    });


    it("extraction-uneven.json SELECT ALL", function(){
      var dataset = new Keen.Dataset().parse(data_extraction_uneven, {
        records: "result",
        select: true
      });
      dataset.sortRows("asc");
      expect(dataset.output())
        .to.be.an("array")
        .and.to.be.of.length(data_extraction_uneven.result.length+1);
      expect(dataset.output()[0]).to.be.of.length(7);
      expect(dataset.output()[0][0]).to.eql("keen.timestamp");
    });


    it("funnel.json", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_funnel, {
        records: "",
        unpack: {
          index: {
            path: "steps -> event_collection",
            type: "string",
            label: "Event",
            replace: {
              "pageview": "Visit",
              "signup": "Join",
              "return-login": "Return",
              "create-post": "Contrib",
              "send-invite": "Invite"
            }
          },
          value: {
            path: "result -> ",
            type: "number"
          }
        }
      });
      expect(dataset.output())
        .to.be.an("array")
        .and.to.be.of.length(6);
      expect(dataset.output()[0][0]).to.eql("Event");
      expect(dataset.output()[0][1]).to.eql("Value");
      expect(dataset.output()[1][0]).to.be.eql("Visit");
      expect(dataset.output()[1][1]).to.be.eql(42);
    });


    it("interval-double-groupBy.json", function(){
      var dataset = new Keen.Dataset();
      dataset.parse(data_interval_double_groupBy, {
        records: "result",
        unpack: {
          index: {
            path: "timeframe -> start",
            type: "date"
          },
          value: {
            path: "value -> result",
            type: "number"
          },
          label: {
            path: "value -> first.property",
            type: "string",
            replace: {}
          }
        }
      });
      expect(dataset.output()).to.be.an("array")
        .and.to.be.of.length(4);
    });

  });

  describe("#input", function() {
    it("should set and get a copy of raw data", function(){
      var data = { value: 0 };
      this.ds.input(data);
      expect(this.ds.input()).to.be.an("object")
        .and.to.eql(data);
    });
    it("should unset this copy by passing null", function(){
      this.ds.input(null);
      expect(this.ds.input()).to.be.null;
    });
  });

  describe("#output", function() {
    it("should set and get a copy of output data", function(){
      var data = [["Header"][125]];
      this.ds.output(data);
      expect(this.ds.output()).to.be.an("array")
        .and.to.eql(data);
    });
    it("should unset this copy by passing null", function(){
      this.ds.output(null);
      expect(this.ds.output()).to.be.null;
    });
  });

  describe("#method", function() {
    it("should set and get the parser method", function(){
      this.ds.method("select");
      expect(this.ds.method()).to.be.a("string")
        .and.to.eql("select");
    });
    it("should unset this copy by passing null", function(){
      this.ds.method(null);
      expect(this.ds.method()).to.be.null;
    });
  });

  describe("#schema", function() {
    it("should set and get the parser schema", function(){
      var schema = { records: "", select: true };
      this.ds.schema(schema);
      expect(this.ds.schema()).to.be.an("object")
        .and.to.deep.equal(schema);
    });
    it("should unset the schema by passing null", function(){
      this.ds.schema(null);
      expect(this.ds.schema()).to.be.null;
    });
  });

  describe("Access Rows", function(){

    describe("#selectRow", function() {
      it("should return a given row", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(table[1]);
      });
      it("should accept a string query argument (indexOf match)", function(){
        var table = [["Index", "A", "B"],["a", 342, 664],["b", 353, 322]];
        this.ds.output(table);
        expect(this.ds.selectRow("a")).to.be.an("array")
          .and.to.deep.equal(table[1]);
      });
    });

    describe("#appendRow", function() {
      it("should append a row of nulls when passed nothing", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendRow(2);
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal([2, null, null]);
      });
      it("should append a given row when passing an array", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendRow(2, [344, 554]);
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal([2, 344, 554]);
      });
      it("should append a given row when passing a computational helper", function(){
        var table = [["Index", "A", "B"],[0, 10, 20],[1, 5, 5]];
        this.ds.output(table);
        this.ds.appendRow(2, this.ds.getColumnSum);
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal([2, 15, 25]);
      });
      it("should append a given row when passing a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendRow(0, function(c, i){
          return 0;
        });
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal([0, 0, 0]);
      });
      it("should append an empty row when nothing returned from a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendRow(2, function(){});
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal([2, null, null]);
      });
    });

    describe("#insertRow", function() {
      it("should insert a row of nulls at a given index when passed nothing", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertRow(1);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([null, null, null]);
      });
      it("should insert a given row at a given index", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertRow(1, 2, [344, 554]);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([2, 344, 554]);
      });
      it("should insert a given row when passing a computational helper", function(){
        var table = [["Index", "A", "B"],[0, 10, 20],[1, 5, 5]];
        this.ds.output(table);
        this.ds.insertRow(1, "Total", this.ds.getColumnSum);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["Total", 15, 25]);
      });
      it("should insert a given row when passing a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertRow(1, "Total", function(c, i){
          return 0;
        });
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["Total", 0, 0]);
      });
      it("should insert an empty row when nothing is returned from a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertRow(1, "Total", function(){});
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["Total", null, null]);
      });
    });

    describe("#updateRow", function() {
      it("should replace a given row by passing a new one", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateRow(1, [10, 10]);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([0, 10, 10]);
      });
      it("should accept a string query argument (indexOf match)", function(){
        var table = [["Index", "A", "B"],["a", 342, 664],["b", 353, 322]];
        this.ds.output(table);
        this.ds.updateRow("a", [1, 2]);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["a", 1, 2]);
      });
      it("should rewrite a given row with a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateRow(1, function(value, index, col){
          return this.getColumnSum(col);
        });
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([1, 695, 986]);
      });
      it("should keep the previous cell value if nothing is returne from a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateRow(1, function(){});
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([0, 342, 664]);
      });
      it("should rewrite a given row with a computational helper", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateRow(1, function(value, index, col){
          return this.getColumnSum(col);
        });
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([1, 695, 986]);
      });
    });

    describe("#deleteRow", function() {
      it("should delete a given row", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.deleteRow(1);
        expect(this.ds.output()).to.be.an("array")
          .and.to.have.length(2);
      });
      it("should accept a string query argument (indexOf match)", function(){
        var table = [["Index", "A", "B"],["a", 342, 664],["b", 353, 322]];
        this.ds.output(table);
        this.ds.deleteRow("a");
        expect(this.ds.output()).to.be.an("array")
          .and.to.have.length(2);
      });
    });

    describe("#filterRows", function() {
      it("should delete rows not surviving the filter", function(){
        var table = [["Index", "A", "B"],[0, 5, 5],[1, 10, 10]];
        this.ds.output(table);
        this.ds.filterRows(function(row, i){
          var total = 0;
          for (var i=0; i < row.length; i++){
            if (i > 0 && !isNaN(parseInt(row[i]))) {
              total += parseInt(row[i]);
            }
          }
          return total < 11;
        });
        expect(this.ds.output()).to.be.an("array")
          .and.to.have.length(2);
        expect(this.ds.output()[1][1]).to.be.a("number")
          .and.to.eql(5);
      });
    });

    describe("#sortRows", function(){
      beforeEach(function(){
        this.ds.output([
          ["Index", "A", "B", "C"],
          [0, 1, 5, 10],
          [1, 2, 10, 20],
          [2, 4, 20, 40]
        ]);
      });
      it("should sort rows properly, without calling a comparator", function(){
        expect(this.ds.sortRows("asc").output()[1][0]).to.eql(0);
        expect(this.ds.sortRows("desc").output()[1][0]).to.eql(2);
      });
      it("should sort rows properly, when calling a general comparator (sum)", function(){
        expect(this.ds
          .sortRows("asc", this.ds.sum, 1)
          .output()[1][0])
        .to.eql(0);
        expect(this.ds
          .sortRows("desc", this.ds.sum, 1)
          .output()[1][0])
        .to.eql(2);
      });
      it("should sort rows ascending, when calling a specific comparator (getRowSum)", function(){
        expect(this.ds
          .sortRows("asc", this.ds.getRowSum)
          .output()[1][0])
        .to.eql(0);
        expect(this.ds
          .sortRows("desc", this.ds.getRowSum)
          .output()[1][0])
        .to.eql(2);
      });
      it("should sort rows ascending, when calling a custom comparator", function(){
        var demo = function(row){
          return this.getRowSum(row);
        };
        expect(this.ds
          .sortRows("asc", demo)
          .output()[1][0])
        .to.eql(0);
        expect(this.ds
          .sortRows("desc", demo)
          .output()[1][0])
        .to.eql(2);
      });
    });

  });








  describe("Access Columns", function(){


    describe("#selectColumn", function() {
      it("should return an array representing a given column", function(){
        this.ds.output([["Index", "A", "B"],[0, 342, 664],[1, 353, 322]]);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["A", 342, 353]);
      });
      it("should accept a string query argument (indexOf match)", function(){
        this.ds.output([["Index", "A", "B"],[0, 342, 664],[1, 353, 322]]);
        expect(this.ds.selectColumn("A")).to.be.an("array")
          .and.to.deep.equal(["A", 342, 353]);
      });
    });

    describe("#appendColumn", function() {
      it("should append a given column of nulls when passed nothing", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendColumn("C");
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["C", null, null]);
      });
      it("should append a given column when passing an array", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendColumn("C", [0, 0]);
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["C", 0, 0]);
      });
      it("should append a given column when passing a computational helper", function(){
        var table = [["Index", "A", "B"],[0, 1, 1],[1, 2, 2]];
        this.ds.output(table);
        this.ds.appendColumn("C", this.ds.getRowSum);
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["C", 2, 4]);
      });
      it("should append a given column when passing a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendColumn("C", function(row, i){
          return 0;
        });
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["C", 0, 0]);
      });
      it("should append a column of empty values nothing is returned from a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.appendColumn("C", function(){});
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["C", null, null]);
      });
    });

    describe("#insertColumn", function() {
      it("should insert a column of nulls when passing nothing", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertColumn(1);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal([null, null, null]);
      });
      it("should insert a given column at a given index", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertColumn(1, "_", [0, 0]);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["_", 0, 0]);
      });
      it("should insert a given column at a given index when passing a computational helper", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertColumn(1, "Total", this.ds.getRowSum);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["Total", 1006, 675]);
      });
      it("should insert a given column at a given index when passing a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertColumn(1, "Total", function(r){
          return 0;
        });
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["Total", 0, 0]);
      });
      it("should insert an empty column when nothing is returned from a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.insertColumn(1, "Total", function(){});
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["Total", null, null]);
      });
    });

    describe("#updateColumn", function() {
      it("should replace a given column by passing a new one", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateColumn(1, [0, 0]);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["A", 0, 0]);
      });
      it("should accept a string query argument (indexOf match)", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateColumn("A", [0, 0]);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["A", 0, 0]);
      });
      it("should rewrite each cell of given column with a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateColumn(1, function(value, index, row){ return 5; });
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["A", 5, 5]);
      });
      it("should keep the previous cell value when nothing returned from a custom function", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateColumn(1, function(){});
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["A", 342, 353]);
      });
      it("should rewrite each cell of given column with a computational helper", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateColumn(1, function(value, index, row){
          return this.getRowSum(row);
        });
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["A", 1006, 675]);
      });
    });

    describe("#deleteColumn", function() {
      it("should delete a given column", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.deleteColumn(1);
        expect(this.ds.output()).to.be.an("array")
          .and.to.have.length(3);
        expect(this.ds.output()[0]).to.be.an("array")
          .and.to.have.length(2);
        expect(this.ds.output()[0][1]).to.be.a("string")
          .and.to.eql("B");
      });
      it("should accept a string query argument (indexOf match)", function(){
        var table = [["Index", "A", "B"],["b", 342, 664],["b", 353, 322]];
        this.ds.output(table);
        this.ds.deleteColumn("A");
        expect(this.ds.output()).to.be.an("array")
          .and.to.have.length(3);
        expect(this.ds.output()[0]).to.be.an("array")
          .and.to.have.length(2);
        expect(this.ds.output()[0][1]).to.be.a("string")
          .and.to.eql("B");
      });
    });

    describe("#filterColumns", function() {
      it("should delete columns not surviving the filter", function(){
        var table = [["Index", "A", "B"],[0, 5, 10],[1, 10, 10]];
        this.ds.output(table);
        this.ds.filterColumns(function(col, index){
          if (index < 1) return true;
          var total = 0;
          for (var i=0; i < col.length; i++){
            if (i > 0 && !isNaN(parseInt(col[i]))) {
              total += parseInt(col[i]);
            }
          }
          return total > 15;
        });
        expect(this.ds.output()).to.be.an("array")
          .and.to.have.length(3);
        expect(this.ds.output()[0]).to.be.an("array")
          .and.to.have.length(2);
        expect(this.ds.output()[0][1]).to.be.a("string")
          .and.to.eql("B");
      });
    });


    describe("#sortColumns", function(){
      beforeEach(function(){
        this.ds.output([
          ["Index", "A", "B", "C"],
          [0, 1, 5, 10],
          [1, 2, 10, 20],
          [2, 4, 20, 40]
        ]);
      });
      it("should sort columns properly, without calling a comparator", function(){
        this.ds.sortColumns("asc");
        expect(this.ds.output()[0][1]).to.eql("A");
        this.ds.sortColumns("desc");
        expect(this.ds.output()[0][1]).to.eql("C");
      });
      it("should sort columns properly, when calling a general comparator (sum)", function(){
        expect(this.ds
          .sortColumns("asc", this.ds.sum, 1)
          .output()[0][1])
        .to.eql("A");
        expect(this.ds
          .sortColumns("desc", this.ds.sum, 1)
          .output()[0][1])
        .to.eql("C");
      });
      it("should sort columns ascending, when calling a specific comparator (getColumnSum)", function(){
        expect(this.ds
          .sortColumns("asc", this.ds.getColumnSum)
          .output()[0][1])
        .to.eql("A");
        expect(this.ds
          .sortColumns("desc", this.ds.getColumnSum)
          .output()[0][1])
        .to.eql("C");
      });
      it("should sort columns ascending, when calling a custom comparator", function(){
        var demo = function(row){
          return this.getColumnSum(row);
        };
        expect(this.ds
          .sortColumns("asc", demo)
          .output()[0][1])
        .to.eql("A");
        expect(this.ds
          .sortColumns("desc", demo)
          .output()[0][1])
        .to.eql("C");
      });
    });


  });


  describe("Helpers", function(){

    describe("#sum", function(){
      it("should return the sum for an unbounded range", function(){
        var sum = this.ds.sum([10,10,10,10,10]);
        expect(sum).to.eql(50);
      });
      it("should return the sum for a partially bounded range", function(){
        var sum = this.ds.sum([10,10,10,10,10], 1);
        expect(sum).to.eql(40);
      });
      it("should return the sum for a fully bounded range", function(){
        var sum = this.ds.sum([10,10,10,10,10], 1, 3);
        expect(sum).to.eql(30);
      });
      describe("#getRowSum", function(){
        it("should return the sum of values in a given row (array), excluding the first value", function(){
          var sum = this.ds.getRowSum([2, 0, 1, 2, 3]);
          expect(sum).to.eql(6);
        });
      });
      describe("#getColumnSum", function(){
        it("should return the sum of values in a given column (array), excluding the first value", function(){
          var sum = this.ds.getColumnSum([2, 0, 1, 2, 3]);
          expect(sum).to.eql(6);
        });
      });
    });

    describe("#average", function(){
      it("should return the average for an unbounded range", function(){
        var avg = this.ds.average([1,2,3,4,5]);
        expect(avg).to.eql(3);
      });
      it("should return the average for a partially bounded range", function(){
        var avg = this.ds.average([1,2,3,4,5], 1);
        expect(avg).to.eql(3.5);
      });
      it("should return the average for a fully bounded range", function(){
        var avg = this.ds.average([1,2,3,4,5], 1, 3);
        expect(avg).to.eql(3);
      });
      describe("#getRowAverage", function(){
        it("should return the average of values in a given row (array), excluding the first value", function(){
          var avg = this.ds.getRowAverage(["Exclude", 0, 1, 2, 3]);
          expect(avg).to.eql(1.5);
        });
      });
      describe("#getColumnAverage", function(){
        it("should return the average of values in a given column (array), excluding the first value", function(){
          var avg = this.ds.getColumnAverage(["Exclude", 0, 1, 2, 3]);
          expect(avg).to.eql(1.5);
        });
      });
    });


    describe("#minimum", function(){
      it("should return the minimum for an unbounded range", function(){
        var min = this.ds.minimum([1,2,3,4,5]);
        expect(min).to.eql(1);
      });
      it("should return the minimum for a partially bounded range", function(){
        var min = this.ds.minimum([1,2,3,4,5], 1);
        expect(min).to.eql(2);
      });
      it("should return the minimum for a fully bounded range", function(){
        var min = this.ds.minimum([1,2,3,4,5], 1, 3);
        expect(min).to.eql(2);
      });
      describe("#getRowMinimum", function(){
        it("should return the minimum of values in a given row (array), excluding the first value", function(){
          var min = this.ds.getRowMinimum(["Exclude", 0, 1, 2, 3]);
          expect(min).to.eql(0);
        });
      });
      describe("#getColumnMinimum", function(){
        it("should return the minimum of values in a given column (array), excluding the first value", function(){
          var min = this.ds.getColumnMinimum(["Exclude", 0, 1, 2, 3]);
          expect(min).to.eql(0);
        });
      });
    });

    describe("#maximum", function(){
      it("should return the maximum for an unbounded range", function(){
        var max = this.ds.maximum([1,2,3,4,5]);
        expect(max).to.eql(5);
      });
      it("should return the maximum for a partially bounded range", function(){
        var max = this.ds.maximum([1,2,3,4,5], 1);
        expect(max).to.eql(5);
      });
      it("should return the maximum for a fully bounded range", function(){
        var max = this.ds.maximum([1,2,3,4,5], 1, 3);
        expect(max).to.eql(4);
      });
      describe("#getRowMaximum", function(){
        it("should return the maximum of values in a given row (array), excluding the first value", function(){
          var max = this.ds.getRowMaximum(["Exclude", 0, 1, 2, 3]);
          expect(max).to.eql(3);
        });
      });
      describe("#getColumnMaximum", function(){
        it("should return the maximum of values in a given column (array), excluding the first value", function(){
          var max = this.ds.getColumnMaximum(["Exclude", 0, 1, 2, 3]);
          expect(max).to.eql(3);
        });
      });
    });



    describe("#pick", function(){
      it("should return a given index of an array", function(){
        expect(this.ds.pick(["A","B"], 1)).to.eql("B");
      });
      describe("#getRowIndex", function(){
        it("should return the first value of a given row (array)", function(){
          expect(this.ds.getRowIndex(["Index", 0, 1, 2, 3])).to.eql("Index");
        });
      });
      describe("#getColumnLabel", function(){
        it("should return the first value of a given column (array)", function(){
          expect(this.ds.getColumnLabel(["Series A", 1, 2, 3, 4,])).to.eql("Series A");
        });
      });
    });



  });



});
