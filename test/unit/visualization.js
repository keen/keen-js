describe("Keen.Visualization", function(){
  beforeEach(function(){
    var el = document.getElementById("chart-test");
    this.viz = new Keen.Visualization({ result: 0 }, el);
  });
  afterEach(function(){
    this.viz.destroy();
    this.viz = null;
    Keen.Dataviz.visuals = new Array();
  });
  describe("constructor", function(){
    it("should return a new Keen.Dataviz instance", function(){
      expect(this.viz).to.be.an.instanceof(Keen.Dataviz);
    });
    it("should contain view attributes matching Keen.Visualization.defaults", function(){
      expect(this.viz.attributes()).to.deep.equal(Keen.Visualization.defaults);
    });
    it("should contain view defaults matching Keen.Dataviz.defaults", function(){
      expect(this.viz.view.defaults).to.deep.equal(Keen.Dataviz.defaults);
    });
    it("should be appended to Keen.Dataviz.visuals", function(){
      expect(Keen.Dataviz.visuals).to.have.length(1);
      expect(Keen.Dataviz.visuals[0]).and.to.be.an.instanceof(Keen.Dataviz);
    });
  });
});
