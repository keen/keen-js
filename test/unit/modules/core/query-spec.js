var expect = require("chai").expect;

var Keen = require("../../../../src/core"),
    keenHelper = require("../../helpers/test-config");

describe("Keen.Query", function() {

  beforeEach(function() {
    this.project = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey
    });
    this.query = new Keen.Query("count", {
      eventCollection: "test-collection"
    });
  });

  afterEach(function(){
    this.project = void 0;
    this.query = void 0;
  });

  describe("constructor", function() {

    it("should create a new Keen.Query instance", function(){
      expect(this.query).to.be.an.instanceof(Keen.Query);
    });

    it("should have a correct analysis propery", function(){
      expect(this.query).to.have.property("analysis").eql("count");
    });

    it("should have a params object", function(){
      expect(this.query).to.have.property("params");
    });

    it("should have a params.event_collection property", function(){
      expect(this.query.params).to.have.property("event_collection").eql("test-collection");
    });

  });

  describe("#addFilter", function(){

    it("should add filters correctly", function(){
      this.query.addFilter("property", "eq", "value");
      expect(this.query.params).to.have.property("filters")
        .that.is.an('array')
        .with.deep.property('[0]')
        .that.deep.equals({
          operator: "eq",
          property_name: "property",
          property_value: "value"
        });
    });

    it("should allow filters with values that are null or false", function(){
      this.query.addFilter("a", "eq", null);
      this.query.addFilter("b", "eq", false);
      expect(this.query.params.filters[0]).to.deep.equals({
        operator: "eq",
        property_name: "a",
        property_value: null
      });
      expect(this.query.params.filters[1]).to.deep.equals({
        operator: "eq",
        property_name: "b",
        property_value: false
      });
    });

    it("should allow multiple filters on the same property name", function(){
      this.query.addFilter("a", "eq", "b");
      this.query.addFilter("a", "eq", "c");
      expect(this.query.params.filters[0]).to.deep.equals({
        operator: "eq",
        property_name: "a",
        property_value: "b"
      });
      expect(this.query.params.filters[1]).to.deep.equals({
        operator: "eq",
        property_name: "a",
        property_value: "c"
      });
    });

  });

  describe("#get", function(){

    it("should return values for camelCased attributes", function(){
      expect(this.query.get("eventCollection")).to.eql("test-collection");
    });

    it("should return values for underscored attributes", function(){
      expect(this.query.get("event_collection")).to.eql("test-collection");
    });

  });

  describe("#set", function(){

    it("should set multiple specified attributes", function(){
      this.query.set({ timeframe: "this_7_days", interval: "daily" });
      expect(this.query.params).to.have.property("timeframe").eql("this_7_days");
      expect(this.query.params).to.have.property("interval").eql("daily");
    });

    it("should apply the latest attribute over previous values", function(){
      this.query.set({ timeframe: "this_7_days", interval: "daily" });
      this.query.set({ timeframe: "this_21_days" });
      this.query.set({ timeframe: "this_14_days" });
      expect(this.query.params).to.have.property("timeframe").eql("this_14_days");
      expect(this.query.params).to.have.property("interval").eql("daily");
    });

  });



});
