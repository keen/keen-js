describe("Keen Query", function() {

  beforeEach(function() {
    this.keen = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey
    });
    this.query = new Keen.Query("count", {
      eventCollection: "test-collection"
    });
    //console.log(this.query);
  });

  afterEach(function(){
    this.keen = void 0;
    this.query = void 0;
  });

  describe("constructor", function() {

    it("should create a new Keen.Query instance", function(){
      expect(this.query).to.be.an.instanceof(Keen.Query);
    });

    it("should have a correct analysis propery", function(){
      expect(this.query).to.have.property("analysis").eql("count");
    });

    it("should have a correct path propery", function(){
      expect(this.query).to.have.property("path").eql("/queries/count");
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

  describe("#on", function(){
    it("should attach custom event listeners with #on", function(){
      this.query.on("whatever", sinon.spy());
      expect(this.query).to.have.property("listeners")
        .that.is.an("object")
        .that.has.property("whatever")
        .that.is.an("array")
        .with.deep.property('[0]')
        .that.is.an("object")
        .that.has.property("callback");
    });
  });

  describe("#trigger", function(){
    it("should call bound functions when triggered", function(){
      var callback = sinon.spy();
      this.query.on("whatever", callback);
      this.query.trigger("whatever");
      expect(callback.calledOnce).to.be.ok;
    });

    it("should pass arguments to bound functions when triggered", function(){
      var callback = sinon.spy(),
          payload = { status: "ok" };
      this.query.on("whatever", callback);
      this.query.trigger("whatever", payload);
      expect(callback.calledWith(payload)).to.be.ok;
    });

    it("should call bound functions multiple when triggered multiple times", function(){
      var callback = sinon.spy();
      this.query.on("whatever", callback);
      this.query.trigger("whatever");
      this.query.trigger("whatever");
      this.query.trigger("whatever");
      expect(callback.callCount).to.eql(3);
    });
  });

  describe("#off", function(){
    it("should remove all listeners for an event name with #off(name)", function(){
      var callback = sinon.spy();
      this.query.on("whatever", callback);
      this.query.on("whatever", callback);
      this.query.off("whatever");
      this.query.trigger("whatever");
      expect(callback.callCount).to.eql(0);
    });

    it("should remove specified listeners with #off(name, callback)", function(){
      var callback = sinon.spy(),
          fakeback = function(){
            throw Error("Don't call me!");
          };
      this.query.on("whatever", callback);
      this.query.on("whatever", fakeback);
      this.query.off("whatever", fakeback);
      this.query.trigger("whatever");
      expect(callback.callCount).to.eql(1);
    });
  });

  describe("#once", function() {
    it("should call once handlers once when triggered", function(){
      var query = this.query;
      var callbackA = sinon.spy();
      var callbackB = sinon.spy();
      this.query.once('event', callbackA);
      this.query.once('event', callbackB);
      this.query.trigger('event');
      expect(callbackA.callCount).to.eql(1);
      expect(callbackB.callCount).to.eql(1);
      this.query.trigger('event');
      expect(callbackA.callCount).to.eql(1);
      expect(callbackB.callCount).to.eql(1);
    });
  });

});
