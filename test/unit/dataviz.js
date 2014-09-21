describe("Keen.Dataviz", function(){

  beforeEach(function(){
    this.project = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey
    });
    this.query = new Keen.Query("count", {
      eventCollection: "test-collection"
    });
    this.dataviz = new Keen.Dataviz();
    // console.log(this.dataviz);
  });
  afterEach(function(){
    this.project = null;
    this.query = null;
    this.dataviz = null;
    Keen.Dataviz.visuals = new Array();
  });

  describe("constructor", function(){
    it("should create a new Keen.Dataviz instance", function(){
      expect(this.dataviz).to.be.an.instanceof(Keen.Dataviz);
    });
    it("should contain a new Keen.Dataset instance", function(){
      expect(this.dataviz.dataset).to.be.an.instanceof(Keen.Dataset);
    });
    it("should contain a view object", function(){
      expect(this.dataviz.view).to.be.an("object");
    });
    it("should contain view attributes matching Keen.Dataviz.defaults", function(){
      expect(this.dataviz.view.attributes).to.deep.equal(Keen.Dataviz.defaults.attributes);
    });
    it("should contain view defaults also matching Keen.Dataviz.defaults", function(){
      expect(this.dataviz.view.defaults).to.deep.equal(Keen.Dataviz.defaults.attributes);
    });
    it("should be appended to Keen.Dataviz.visuals", function(){
      expect(Keen.Dataviz.visuals).to.have.length(1);
      expect(Keen.Dataviz.visuals[0]).and.to.be.an.instanceof(Keen.Dataviz);
    });
  });

  describe("#attributes", function(){
    it("should get the current properties", function(){
      expect(this.dataviz.attributes()).to.deep.equal(Keen.Dataviz.defaults.attributes);
    });
    it("should set a hash of properties", function(){
      this.dataviz.attributes({ title: "Updated Attributes", width: 600 });
      expect(this.dataviz.view.attributes.title).to.be.a("string")
        .and.to.eql("Updated Attributes");
      expect(this.dataviz.view.attributes.width).to.be.a("number")
        .and.to.eql(600);
    });
    it("should unset properties by passing null", function(){
      this.dataviz.adapter({ height: null });
      expect(this.dataviz.view.adapter.height).to.not.exist;
    });
  });

  // it("should", function(){});

  describe("#colors", function(){
    it("should get the current color set", function(){
      expect(this.dataviz.colors()).to.be.an("array")
        .and.to.eql(Keen.Dataviz.defaults.attributes.colors);
    });
    it("should set a new array of colors", function(){
      var array = ["red","green","blue"];
      this.dataviz.colors(array);
      expect(this.dataviz.colors()).to.be.an("array")
        .and.to.have.length(3)
        .and.to.eql(array);
    });
    it("should unset the colors set by passing null", function(){
      var array = ["red","green","blue"];
      this.dataviz.colors(array);
      this.dataviz.colors(null);
      expect(this.dataviz.colors()).to.not.exist;
    });
  });

  describe("#colorMapping", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.colorMapping()).to.be.an("undefined");
    });
    it("should set and get a hash of properties", function(){
      var hash = { "A": "#aaa", "B": "#bbb" };
      this.dataviz.colorMapping(hash);
      expect(this.dataviz.colorMapping()).to.be.an("object")
        .and.to.deep.equal(hash);
    });
    it("should unset a property by passing null", function(){
      var hash = { "A": "#aaa", "B": "#bbb" };
      this.dataviz.colorMapping(hash);
      expect(this.dataviz.colorMapping().A).to.be.a("string")
        .and.to.eql("#aaa");
      this.dataviz.colorMapping({ "A": null });
      expect(this.dataviz.colorMapping().A).to.not.exist;
    });
  });

  describe("#labels", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.labels()).to.be.an("undefined");
    });
    it("should set and get a new array of labels", function(){
      var array = ["A","B","C"];
      this.dataviz.labels(array);
      expect(this.dataviz.labels()).to.be.an("array")
        .and.to.have.length(3)
        .and.to.eql(array);
    });
    it("should unset the labels set by passing null", function(){
      var array = ["A","B","C"];
      this.dataviz.labels(array);
      this.dataviz.labels(null);
      expect(this.dataviz.labels()).to.not.exist;
    });
  });

  describe("#labelMapping", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.labelMapping()).to.be.an("undefined");
    });
    it("should set and get a hash of properties", function(){
      var hash = { "_a_": "A", "_b_": "B" };
      this.dataviz.labelMapping(hash);
      expect(this.dataviz.labelMapping()).to.be.an("object")
        .and.to.deep.equal(hash);
    });
    it("should unset a property by passing null", function(){
      var hash = { "_a_": "A", "_b_": "B" };
      this.dataviz.labelMapping(hash);
      expect(this.dataviz.labelMapping()._a_).to.be.a("string")
        .and.to.eql("A");
      this.dataviz.labelMapping({ "_a_": null });
      expect(this.dataviz.labelMapping()._a_).to.not.exist;
    });
  });

  describe("#height", function(){
    it("should get the default height", function(){
      expect(this.dataviz.height()).to.be.a("number")
        .and.to.equal(Keen.Dataviz.defaults.attributes.height);
    });
    it("should set and get a new height", function(){
      var height = 375;
      this.dataviz.height(height);
      expect(this.dataviz.height()).to.be.a("number")
        .and.to.eql(height);
    });
    it("should unset the height by passing null", function(){
      this.dataviz.height(null);
      expect(this.dataviz.height()).to.not.exist;
    });
  });

  describe("#title", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.title()).to.be.an("undefined");
    });
    it("should set and get a new title", function(){
      var title = "New Title";
      this.dataviz.title(title);
      expect(this.dataviz.title()).to.be.a("string")
        .and.to.eql(title);
    });
    it("should unset the title by passing null", function(){
      this.dataviz.title(null);
      expect(this.dataviz.title()).to.not.exist;
    });
  });

  describe("#width", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.width()).to.be.an("undefined");
    });
    it("should set and get a new width", function(){
      var width = 900;
      this.dataviz.width(width);
      expect(this.dataviz.width()).to.be.a("number")
        .and.to.eql(width);
    });
    it("should unset the width by passing null", function(){
      this.dataviz.width(null);
      expect(this.dataviz.width()).to.not.exist;
    });
  });

  describe("#adapter", function(){
    it("should get the current adapter properties", function(){
      expect(this.dataviz.adapter()).to.be.an("object")
        .and.to.contain.keys("library", "chartType", "defaultChartType", "dataType");
      expect(this.dataviz.adapter().library).to.be.an("undefined");
      expect(this.dataviz.adapter().chartType).to.be.an("undefined");
    });
    it("should set a hash of properties", function(){
      this.dataviz.adapter({ library: "lib2", chartType: "pie" });
      expect(this.dataviz.view.adapter.library).to.be.a("string")
        .and.to.eql("lib2");
      expect(this.dataviz.view.adapter.chartType).to.be.a("string")
        .and.to.eql("pie");
    });
    it("should unset properties by passing null", function(){
      this.dataviz.adapter({ library: null });
      expect(this.dataviz.view.adapter.library).to.not.exist;
    });
  });

  describe("#library", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.library()).to.be.an("undefined");
    });
    it("should set and get a new library", function(){
      var lib = "nvd3";
      this.dataviz.library(lib);
      expect(this.dataviz.library()).to.be.a("string")
        .and.to.eql(lib);
    });
    it("should unset the library by passing null", function(){
      this.dataviz.library(null);
      expect(this.dataviz.library()).to.not.exist;
    });
  });

  describe("#chartOptions", function(){
    it("should set and get a hash of properties", function(){
      var hash = { legend: { position: "none" }, isStacked: true };
      this.dataviz.chartOptions(hash);
      expect(this.dataviz.view.adapter.chartOptions.legend).to.be.an("object")
        .and.to.deep.eql(hash.legend);
      expect(this.dataviz.view.adapter.chartOptions.isStacked).to.be.a("boolean")
        .and.to.eql(true);
    });
    it("should unset properties by passing null", function(){
      var hash = { legend: { position: "none" }, isStacked: true };
      this.dataviz.chartOptions(hash);
      this.dataviz.chartOptions({ legend: null });
      expect(this.dataviz.view.adapter.chartOptions.legend).to.not.exist;
    });
  });

  describe("#chartType", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.chartType()).to.be.an("undefined");
    });
    it("should set and get a new chartType", function(){
      var chartType = "magic-pie"
      this.dataviz.chartType(chartType);
      expect(this.dataviz.chartType()).to.be.a("string")
        .and.to.eql(chartType);
    });
    it("should unset properties by passing null", function(){
      this.dataviz.chartType(null);
      expect(this.dataviz.chartType()).to.not.exist;
    });
  });

  describe("#defaultChartType", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.defaultChartType()).to.be.an("undefined");
    });
    it("should set and get a new chartType", function(){
      var defaultType = "backup-pie";
      this.dataviz.defaultChartType(defaultType);
      expect(this.dataviz.defaultChartType()).to.be.a("string")
        .and.to.eql(defaultType);
    });
    it("should unset chartType by passing null", function(){
      this.dataviz.defaultChartType(null);
      expect(this.dataviz.defaultChartType()).to.not.exist;
    });
  });

  describe("#dataType", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.dataType()).to.be.an("undefined");
    });
    it("should set and get a new dataType", function(){
      var dataType = "cat-interval";
      this.dataviz.dataType(dataType);
      expect(this.dataviz.dataType()).to.be.a("string")
        .and.to.eql(dataType);
    });
    it("should unset dataType by passing null", function(){
      this.dataviz.dataType(null);
      expect(this.dataviz.dataType()).to.not.exist;
    });
  });

  describe("#el", function(){
    it("should return undefined by default", function(){
      expect(this.dataviz.el()).to.be.an("undefined");
    });
    it("should set and get a new el", function(){
      this.dataviz.el(document.getElementById("chart-test"));
      expect(this.dataviz.el()).to.be.an("object");
      if (this.dataviz.el().nodeName) {
        expect(this.dataviz.el().nodeName).to.be.a("string")
          .and.to.eql("DIV");
      }
    });
    it("should unset el by passing null", function(){
      this.dataviz.el(null);
      expect(this.dataviz.el()).to.not.exist;
    });
  });

  describe("#prepare", function(){
    // it("should set el by passing a DOM element", function(){
    //   this.dataviz.prepare(document.getElementById("chart-test"));
    //   expect(this.dataviz.el()).to.be.an("object");
    //   if (this.dataviz.el().nodeName) {
    //     expect(this.dataviz.el().nodeName).to.be.a("string")
    //       .and.to.eql("DIV");
    //   }
    // });

    // it("should inject a new Keen.Spinner into el", function(){});
    // it("should ")
  });

  describe("Adapter actions", function(){
    beforeEach(function(){
      registerDemoAdapter();
      this.dataviz.adapter({ library: "demo", chartType: "chart" });
    });

    describe("#initialize", function(){
      it("should call the #initialize method of a given adapter", function(){
        this.dataviz.initialize();
        expect(Keen.Dataviz.libraries.demo.chart.initialize.called).to.be.ok;
      });
    });

    describe("#render", function(){
      it("should set el by passing a DOM element", function(){
        this.dataviz.render(document.getElementById("chart-test"));
        expect(this.dataviz.el()).to.be.an("object");
        if (this.dataviz.el().nodeName) {
          expect(this.dataviz.el().nodeName).to.be.a("string")
            .and.to.eql("DIV");
        }
      });
      it("should call the #initialize method of a given adapter", function(){
        this.dataviz.initialize();
        expect(Keen.Dataviz.libraries.demo.chart.initialize.called).to.be.ok;
      });
      it("should call the #render method of a given adapter", function(){
        this.dataviz.render(document.getElementById("chart-test"));
        expect(Keen.Dataviz.libraries.demo.chart.render.called).to.be.ok;
      });
      it("should NOT call the #render method if el is NOT set", function(){
        this.dataviz.render();
        expect(Keen.Dataviz.libraries.demo.chart.render.called).to.not.be.ok;
      });
    });

    describe("#update", function(){
      it("should call the #update method of a given adapter if available", function(){
        this.dataviz.update();
        expect(Keen.Dataviz.libraries.demo.chart.update.called).to.be.ok;
      });
      it("should call the #render method of a given adapter if NOT available", function(){
        Keen.Dataviz.libraries.demo.chart.update = void 0;
        this.dataviz.el(document.getElementById("chart-test")).update();
        expect(Keen.Dataviz.libraries.demo.chart.render.called).to.be.ok;
      });
    });

    describe("#destroy", function(){
      it("should call the #destroy method of a given adapter", function(){
        this.dataviz.destroy();
        expect(Keen.Dataviz.libraries.demo.chart.destroy.called).to.be.ok;
      });
    });
    describe("#error", function(){
      it("should call the #error method of a given adapter if available", function(){
        this.dataviz.error();
        expect(Keen.Dataviz.libraries.demo.chart.error.called).to.be.ok;
      });
    });

  });

});


function registerDemoAdapter(){
  Keen.Dataviz.register("demo", {
    "chart": {
      initialize: sinon.spy(),
      render: sinon.spy(),
      update: sinon.spy(),
      destroy: sinon.spy(),
      error: sinon.spy()
    }
  });
}
