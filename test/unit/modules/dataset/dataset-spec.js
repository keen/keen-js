var expect = require("chai").expect;

var Keen = require("../../../../src/core"),
    keenHelper = require("../../helpers/test-config");

var each = require("../../../../src/core/utils/each");

var data_extraction = require('./sample-data/extraction'),
    data_extraction_uneven = require('./sample-data/extraction-uneven')
    data_metric = require('./sample-data/metric'),
    data_interval = require('./sample-data/interval'),
    data_groupBy = require('./sample-data/groupBy'),
    data_groupBy_boolean = require('./sample-data/groupBy-boolean'),
    data_double_groupBy = require('./sample-data/double-groupBy'),
    data_interval_double_groupBy = require('./sample-data/interval-double-groupBy'),
    data_interval_groupBy_empties = require('./sample-data/interval-groupBy-empties'),
    data_interval_groupBy_boolean = require('./sample-data/interval-groupBy-boolean'),
    data_interval_groupBy_nulls = require('./sample-data/interval-groupBy-nulls'),
    data_funnel = require('./sample-data/funnel'),
    data_uniques = require('./sample-data/select-unique');

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
    it("should output the correct values", function(){
      expect(this.ds.output()).to.be.an("array")
        .and.to.be.of.length(2);
      expect(this.ds.output()[0][0]).to.eql("label");
      expect(this.ds.output()[0][1]).to.eql("value");
      expect(this.ds.output()[1][0]).to.eql("result");
      expect(this.ds.output()[1][1]).to.eql(23456);
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


  describe("Access Rows", function(){

    describe("#set", function(){

      it("should create a column and row when they don't already exist (integer)", function(){
        this.ds.output([['Index']]);
        this.ds.set([1,1], 10);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([1, 10]);
      });

      it("should create a column and row when they don't already exist (string)", function(){
        this.ds.output([['Index']]);
        this.ds.set(['A','Row'], 10);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["Row", 10]);
      });

      it("should create multiple columns and rows in the proper order (integers)", function(){
        this.ds.output([['Index']]);
        this.ds.set([1,1], 10);
        this.ds.set([2,2], 10);
        this.ds.set([1,3], 10);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([1, 10, null]);
        expect(this.ds.selectRow(2)).to.be.an("array")
          .and.to.deep.equal([2, null, 10]);
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal([3, 10, null]);
        expect(this.ds.selectColumn(2)).to.be.an("array")
          .and.to.deep.equal([2, null, 10, null]);
      });

      it("should create multiple columns and rows in the proper order (strings)", function(){
        this.ds.output([['Index']]);
        this.ds.set(['A','Row 1'], 10);
        this.ds.set(['B','Row 2'], 10);
        this.ds.set(['A','Row 3'], 10);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["Row 1", 10, null]);
        expect(this.ds.selectRow(2)).to.be.an("array")
          .and.to.deep.equal(["Row 2", null, 10]);
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal(["Row 3", 10, null]);
        expect(this.ds.selectColumn(2)).to.be.an("array")
          .and.to.deep.equal(["B", null, 10, null]);
      });

    });

    describe("#selectRow", function() {
      it("should return a given row", function(){
        var table = [["Index", "A", "B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(table[1]);
      });
      it("should accept a string query argument, even if string starts with a number (indexOf match)", function(){
        var table = [["Index", "A", "B"],["1 a", 342, 664],["1 b", 353, 322]];
        this.ds.output(table);
        expect(this.ds.selectRow("1 a")).to.be.an("array")
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
      it("should extend other rows when passed array is longer than existing rows", function(){
        var table = [
          ["Index", "A", "B"],
          [0, 342, 664],
          [1, 353, 322]
        ];
        this.ds.output(table);
        this.ds.appendRow("new", [ 333, 222, 111 ]);
        expect(this.ds.selectRow("new")).to.be.an("array")
          .and.to.deep.equal(["new", 333, 222, 111]);
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["3", null, null, 111]);
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
      it("should extend other rows when the passed array is longer than other rows", function(){
        var table = [
          ["Index", "A", "B"],
          [0, 342, 664],
          [1, 353, 322]
        ];
        this.ds.output(table);
        this.ds.insertRow(1, "Total", [123, 321, 323, null]);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["Total", 123, 321, 323, null]);
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["3", 323, null, null]);
        expect(this.ds.selectColumn(4)).to.be.an("array")
          .and.to.deep.equal(["4", null, null, null]);
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
      it("should accept a string query argument, even if string starts with a number (indexOf match)", function(){
        var table = [["Index", "A", "B"],["2 a", 342, 664],["1 b", 353, 322]];
        this.ds.output(table);
        this.ds.updateRow("2 a", [1, 2]);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal(["2 a", 1, 2]);
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
      it("should extend other rows when passed array is longer than existing rows", function(){
        var table = [
          ["Index", "A", "B"],
          [0, 342, 664],
          [1, 353, 322]
        ];
        this.ds.output(table);
        this.ds.updateRow(1, [10, 10, null, null]);
        expect(this.ds.selectRow(1)).to.be.an("array")
          .and.to.deep.equal([0, 10,10,null,null]);
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["3", null, null]);
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
      it("should accept a string query argument, even if string starts with a number (indexOf match)", function(){
        var table = [["Index", "A", "B"],["1 a", 342, 664],["2 b", 353, 322]];
        this.ds.output(table);
        this.ds.deleteRow("1 a");
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
      it("should accept a string query argument, even if string starts with a number (indexOf match)", function(){
        this.ds.output([["Index", "1A", "2B"],[0, 342, 664],[1, 353, 322]]);
        expect(this.ds.selectColumn("1A")).to.be.an("array")
          .and.to.deep.equal(["1A", 342, 353]);
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
      it("should extend other columns when passed array is longer than existing columns", function(){
        var table = [
          ["Index", "A", "B"],
          [0, 342, 664],
          [1, 353, 322]
        ];
        this.ds.output(table);
        this.ds.appendColumn("C", [123, 456, 789, 321]);
        expect(this.ds.selectColumn(3)).to.be.an("array")
          .and.to.deep.equal(["C", 123, 456, 789, 321]);
        expect(this.ds.selectRow(3)).to.be.an('array')
          .and.to.deep.equal(["3", null, null, 789]);
        expect(this.ds.selectRow(4)).to.be.an('array')
          .and.to.deep.equal(["4", null, null, 321]);
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

      it("should extend other columns when passed array is longer than existing columns", function(){
        var table = [
          ["Index", "A", "B"],
          [0, 342, 664],
          [1, 353, 322]
        ];
        this.ds.output(table);
        this.ds.insertColumn(1, "Total", [10, 10, 10, null]);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["Total", 10, 10, 10, null]);
        expect(this.ds.selectRow(2)).to.be.an('array')
          .and.to.deep.equal([1, 10, 353, 322]);
        expect(this.ds.selectRow(3)).to.be.an('array')
          .and.to.deep.equal(["3", 10, null, null]);
        expect(this.ds.selectRow(4)).to.be.an('array')
          .and.to.deep.equal(["4", null, null, null]);
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
      it("should accept a string query argument, even if string starts with a number (indexOf match)", function(){
        var table = [["Index", "3 A", "12 B"],[0, 342, 664],[1, 353, 322]];
        this.ds.output(table);
        this.ds.updateColumn("3 A", [0, 0]);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["3 A", 0, 0]);
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
      it("should extend other columns when passed array is longer than existing columns", function(){
        var table = [
          ["Index", "A", "B"],
          [0, 342, 664],
          [1, 353, 322]
        ];
        this.ds.output(table);
        this.ds.updateColumn(1, [10, 10, null, null]);
        expect(this.ds.selectColumn(1)).to.be.an("array")
          .and.to.deep.equal(["A", 10, 10, null, null]);
        expect(this.ds.selectColumn(2)).to.be.an("array")
          .and.to.deep.equal(["B", 664, 322, null, null]);
        expect(this.ds.selectRow(3)).to.be.an("array")
          .and.to.deep.equal(["3", null, null]);
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
      it("should accept a string query argument, even if string starts with a number (indexOf match)", function(){
        var table = [["Index", "1A", "2B"],["b", 342, 664],["b", 353, 322]];
        this.ds.output(table);
        this.ds.deleteColumn("1A");
        expect(this.ds.output()).to.be.an("array")
          .and.to.have.length(3);
        expect(this.ds.output()[0]).to.be.an("array")
          .and.to.have.length(2);
        expect(this.ds.output()[0][1]).to.be.a("string")
          .and.to.eql("2B");
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


  describe('Parse with #set', function() {

    it('metric.json', function(){
      var parser = Keen.Dataset.parser('metric');
      var dataset = parser(data_metric);

      expect(dataset.output())
        .to.be.an('array')
        .and.to.be.of.length(2);
      expect(dataset.output()[0][0]).to.eql('Index');
      expect(dataset.output()[0][1]).to.eql('Value');
      expect(dataset.output()[1][0]).to.eql('Result');
      expect(dataset.output()[1][1]).to.eql(2450);
    });

    it('interval.json (indexed by timeframe.end)', function(){
      var parser = Keen.Dataset.parser('interval', 'timeframe.end');
      var dataset = parser(data_interval);

      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(13);
      expect(dataset.output()[0]).to.be.of.length(2);
      expect(dataset.output()[0][0]).to.eql('Index');
      expect(dataset.output()[0][1]).to.eql('Result');

      // timeframe.end
      expect(dataset.output()[1][0])
        .to.eql('2015-01-01T00:00:00.000Z');
    });

    it('groupby.json', function(){
      var dataset = Keen.Dataset.parser('grouped-metric')(data_groupBy);

      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(56);
      expect(dataset.output()[0]).to.be.of.length(2);
      expect(dataset.output()[0][0]).to.eql('Index');
      expect(dataset.output()[0][1]).to.eql('Result');
    });

    it('groupBy-boolean.json', function(){
      var dataset = Keen.Dataset.parser('grouped-metric')(data_groupBy_boolean);
      dataset.sortRows('desc', dataset.sum, 1);

      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(4);
      expect(dataset.output()[1][0]).to.eql('true');
      expect(dataset.output()[2][0]).to.eql('false');
    });

    it('interval-groupBy-empties.json', function(){
      var dataset = Keen.Dataset.parser('grouped-interval')(data_interval_groupBy_empties);
      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(7);
    });

    it('interval-groupBy-boolean.json (indexed by timeframe.end)', function(){
      var parser = Keen.Dataset.parser('grouped-interval', 'timeframe.end');
      var dataset = parser(data_interval_groupBy_boolean);
      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(7);
      expect(dataset.output()[1][0])
        .to.eql('2013-11-01T07:00:00.000Z');
    });

    it('interval-groupBy-nulls.json', function(){
      var dataset = Keen.Dataset.parser('grouped-interval')(data_interval_groupBy_nulls);

      dataset.sortColumns('desc', dataset.sum, 1);
      dataset.sortRows('asc');

      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(7);
      expect(dataset.output()[0]).to.be.of.length(3);
      expect(dataset.output()[0][0]).to.eql('Index');
      expect(dataset.output()[0][1]).to.eql('null');
      expect(dataset.output()[0][2]).to.eql('Windows Vista');
    });

    it('extraction.json 1', function(){
      var dataset = Keen.Dataset.parser('extraction')(data_extraction);

      expect(dataset.output())
        .to.be.an('array')
        .and.to.be.of.length(data_extraction.result.length+1);
      expect(dataset.output()[0]).to.be.of.length(7);
      expect(dataset.output()[0][0]).to.eql('keen.timestamp');
      expect(dataset.output()[0][1]).to.eql('keen.created_at');
      expect(dataset.output()[0][2]).to.eql('keen.id');
    });

    it('extraction-uneven.json', function(){
      var dataset = Keen.Dataset.parser('extraction')(data_extraction_uneven);

      expect(dataset.output())
        .to.be.an('array')
        .and.to.be.of.length(data_extraction_uneven.result.length+1);
    });

    it('funnel.json', function(){
      var dataset = Keen.Dataset.parser('funnel')(data_funnel);

      expect(dataset.output())
        .to.be.an('array')
        .and.to.be.of.length(6);
      expect(dataset.output()[0][0]).to.eql('Index');
      expect(dataset.output()[0][1]).to.eql('Step Value');
      expect(dataset.output()[1][0]).to.be.eql('pageview');
      expect(dataset.output()[1][1]).to.be.eql(42);
    });

    it('double-groupBy.json', function(){
      var parser = Keen.Dataset.parser('double-grouped-metric', [
        'session.geo_information.city',
        'session.geo_information.province' ]);
      var dataset = parser(data_double_groupBy);

      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(194);
      expect(dataset.output()[0])
        .to.be.of.length(2);
    });

    it('interval-double-groupBy.json (indexed by timeframe.end)', function(){
      var parser = Keen.Dataset.parser('double-grouped-interval', [
        'first.property',
        'second.property' ], 'timeframe.end');
      var dataset = parser(data_interval_double_groupBy);

      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(4);
      expect(dataset.output()[0]).to.be.an('array')
        .and.to.be.of.length(5);
      expect(dataset.selectColumn(0)[1]).to.be.a('string')
        .and.to.eql('2014-04-23T07:00:00.000Z');
    });

    it('select-unique.json', function(){
      var dataset = Keen.Dataset.parser('list')(data_uniques);

      expect(dataset.output()).to.be.an('array')
        .and.to.be.of.length(60);
    });

  });


});
