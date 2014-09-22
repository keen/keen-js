describe("Keen.Dataset", function(){

  beforeEach(function(){
    this.ds = new Keen.Dataset({ result: 23456 }, {
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
      expect(this.ds.output()).to.be.an("array");
      expect(this.ds.output()[0][0]).to.be.a("string")
        .and.to.eql("result");
      expect(this.ds.output()[1][0]).to.be.a("number")
        .and.to.eql(23456);
    });
  });

  describe("#parse", function() {

    it("metric.json", function(done){
      $.getJSON("./unit/data/metric.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          records: "",
          select: true
          // select: [
          //   {
          //     path: "result",
          //     type: "number",
          //     replace: {
          //       null: 2450
          //     },
          //     label: "Metric",
          //     format: "1,000.00",
          //     prefix: "$",
          //     suffix: " per month"
          //   }
          // ]
        });
        console.log('metric.json', dataset);

        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(2);
        expect(dataset.output()[0][0]).to.eql("result");
        expect(dataset.output()[1][0]).to.eql(2450);
        //expect(dataset.output()[0][0]).to.eql("Metric");
        //expect(dataset.output()[1][0]).to.eql("$2,450.00 per month");
        done();
      });
    });

    it("groupby.json", function(done){
      $.getJSON("./unit/data/groupby.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          records: "result",
          unpack: {
            value: "result",
            label: {
              path: "page",
              type: "string",
              replace: {
                "http://dustinlarimer.com/": "Home"
              }
            }
          },
          sort: {
            index: 'asc'
          }
        });
        console.log('groupby.json', dataset);

        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(56);
        expect(dataset.output()[0]).to.be.of.length(2);
        expect(dataset.output()[0][0]).to.eql("page");
        expect(dataset.output()[0][1]).to.eql("result");
        done();
      });
    });

    it("groupBy-boolean.json", function(done){
      $.getJSON("./unit/data/groupBy-boolean.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
          ],
          sort: {
            column: 1,
            order: 'desc'
          }
        });
        console.log('groupBy-boolean.json', dataset);
        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(4);
        expect(dataset.output()[1][0]).to.eql("true");
        expect(dataset.output()[2][0]).to.eql("false");
        done();
      });
    });

    it("interval-groupBy-empties.json", function(done){
      $.getJSON("./unit/data/interval-groupBy-empties.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
        console.log('interval-groupBy-empties.json', dataset);
        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(7);
        /*
        expect(dataset.output()[0][0]).to.eql("Event");
        expect(dataset.output()[0][1]).to.eql("Value");
        expect(dataset.output()[1][0]).to.be.eql("Visit");
        expect(dataset.output()[1][1]).to.be.eql(42);*/
        done();
      });
    });

    it("interval-groupBy-boolean.json", function(done){
      $.getJSON("./unit/data/interval-groupBy-boolean.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
        console.log('interval-groupBy-boolean.json', dataset);
        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(7);
        done();
      });
    });

    it("interval-groupBy-nulls.json", function(done){
      $.getJSON("./unit/data/interval-groupBy-nulls.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
          },
          sort: {
            index: 'asc',
            value: 'desc'
          }
        });
        console.log('interval-groupBy-nulls.json', dataset);

        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(7);
        expect(dataset.output()[0]).to.be.of.length(3);
        expect(dataset.output()[0][0]).to.eql("start");
        expect(dataset.output()[0][1]).to.eql("");
        expect(dataset.output()[0][2]).to.eql("Windows Vista");
        done();
      });
    });

    it("extraction.json 1", function(done){
      $.getJSON("./unit/data/extraction.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
          ],
          sort: {
            column: 0,
            order: 'asc'
          }
        });
        console.log('extraction.json 1', dataset);

        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(response.result.length+1);
        expect(dataset.output()[0]).to.be.of.length(3);
        expect(dataset.output()[0][0]).to.eql("Time");
        expect(dataset.output()[0][1]).to.eql("Page");
        expect(dataset.output()[0][2]).to.eql("Referrer");
        // expect(dataset.output()[1][0]).to.be.eql("2014-04-25T20:38:04.084Z");
        done();
      });
    });

    it("extraction.json 2", function(done){
      $.getJSON("./unit/data/extraction.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
          ],
          sort: {
            column: 1,
            order: 'desc'
          }
        });
        console.log('extraction.json 2', dataset);

        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(response.result.length+1);
        expect(dataset.output()[0]).to.be.of.length(3);
        expect(dataset.output()[0][0]).to.eql("keen.timestamp");
        expect(dataset.output()[0][1]).to.eql("page");
        expect(dataset.output()[0][2]).to.eql("referrer");
        //expect(dataset.output()[1][0]).to.be.eql("2014-04-27T04:41:20.573Z");
        done();
      });
    });


    it("extraction-uneven.json", function(done){
      $.getJSON("./unit/data/extraction-uneven.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
        console.log('extraction-uneven.json', dataset);
        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(response.result.length+1);
        done();
      });
    });


    it("extraction-uneven.json SELECT ALL", function(done){
      $.getJSON("./unit/data/extraction-uneven.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          records: "result",
          select: true,
          sort: {
            column: 0,
            order: 'asc'
          }
        });
        console.log('extraction-uneven.json SELECT ALL', dataset);

        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(response.result.length+1);
        expect(dataset.output()[0]).to.be.of.length(7);
        expect(dataset.output()[0][0]).to.eql("keen.timestamp");
        expect(dataset.output()[1][1]).to.be.eql(null);
        expect(dataset.output()[4][1]).to.be.eql("2014-02-05T21:39:12.155Z");
        done();
      });
    });


    it("funnel.json", function(done){
      $.getJSON("./unit/data/funnel.json", function(response) {
        var dataset = new Keen.Dataset(response, {
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
        console.log('funnel.json', dataset);
        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(6);
        expect(dataset.output()[0][0]).to.eql("Event");
        expect(dataset.output()[0][1]).to.eql("Value");
        expect(dataset.output()[1][0]).to.be.eql("Visit");
        expect(dataset.output()[1][1]).to.be.eql(42);
        done();
      });
    });



    it("interval-double-groupBy.json", function(done){
      $.getJSON("./unit/data/interval-double-groupBy.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          records: "result",
          unpack: {
            index: {
              path: "timeframe -> start",
              type: "date",
              //label: "Event",
              /*replace: {
                "pageview": "Visit",
                "signup": "Join",
                "return-login": "Return",
                "create-post": "Contrib",
                "send-invite": "Invite"
              }*/
            },
            value: {
              path: "value -> result",
              type: "number"
            },
            label: {
              path: "value -> first.property",
              type: "string",
              replace: {
                //"/": "Home"
              }
            }
          }
        });
        console.log('interval-double-groupBy.json', dataset);
        expect(dataset.output()).to.be.an("array")
          .and.to.be.of.length(4);
        done();
      });
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
  
  // describe("#selectRow", function() {});
  // describe("#appendRow", function() {});
  // describe("#insertRow", function() {});
  // describe("#modifyRow", function() {});
  // describe("#removeRow", function() {});
  // describe("#filterRows", function() {});
  //
  // describe("#selectColumn", function() {});
  // describe("#appendColumn", function() {});
  // describe("#insertColumn", function() {});
  // describe("#modifyColumn", function() {});
  // describe("#removeColumn", function() {});
  // describe("#filterColumns", function() {});

});
