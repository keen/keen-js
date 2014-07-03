describe("Keen Query", function() {

  beforeEach(function() {
    this.keen = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey
    });
    this.query = new Keen.Query("count", {
      eventCollection: "test-collection"
    });
    console.log(this.query);
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

    it("should have set a params.event_collection property", function(){
      expect(this.query.params).to.have.property("event_collection").eql("test-collection");
    });

  });

  describe("#addFilter", function(){

  });

  describe("#get", function(){

  });

  describe("#set", function(){

  });

  describe("triggers and listeners", function(){

  });

});
