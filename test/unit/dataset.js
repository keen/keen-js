describe("Keen.Dataset", function(){
  beforeEach(function(){
    this.ds = new Keen.Dataset({ result: 23456 }, {
      collection: "",
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
      expect(this.ds.schema).to.deep.equal({ collection: "", select: true });
    });
    it("should have a table property with correct values", function(){
      expect(this.ds.table).to.be.an("array");
      expect(this.ds.table[0][0]).to.be.a("string")
        .and.to.eql("result");
      expect(this.ds.table[1][0]).to.be.a("number")
        .and.to.eql(23456);
    });
  });
});
