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

  describe("#parse", function() {

    it("metric.json", function(done){
      $.getJSON("./unit/data/metric.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "",
          select: [
            {
              path: "result",
              type: "number",
              replace: {
                null: 2450
              },
              label: "Metric",
              format: "1,000.00",
              prefix: "$",
              suffix: " per month"
            }
          ]
        });
        console.log('metric.json', dataset);

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(2);
        expect(dataset.table[0][0]).to.eql("Metric");
        expect(dataset.table[1][0]).to.eql("$2,450.00 per month");
        done();
      });
    });

    it("groupby.json", function(done){
      $.getJSON("./unit/data/groupby.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(56);
        expect(dataset.table[0]).to.be.of.length(2);
        expect(dataset.table[0][0]).to.eql("page");
        expect(dataset.table[0][1]).to.eql("result");
        done();
      });
    });

    it("groupBy-boolean.json", function(done){
      $.getJSON("./unit/data/groupBy-boolean.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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
        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(4);
        expect(dataset.table[1][0]).to.eql("true");
        expect(dataset.table[2][0]).to.eql("false");
        done();
      });
    });

    it("interval-groupBy-empties.json", function(done){
      $.getJSON("./unit/data/interval-groupBy-empties.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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
        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(7);
        /*
        expect(dataset.table[0][0]).to.eql("Event");
        expect(dataset.table[0][1]).to.eql("Value");
        expect(dataset.table[1][0]).to.be.eql("Visit");
        expect(dataset.table[1][1]).to.be.eql(42);*/
        done();
      });
    });

    it("interval-groupBy-boolean.json", function(done){
      $.getJSON("./unit/data/interval-groupBy-boolean.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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
        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(7);
        done();
      });
    });

    it("interval-groupBy-nulls.json", function(done){
      $.getJSON("./unit/data/interval-groupBy-nulls.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(7);
        expect(dataset.table[0]).to.be.of.length(3);
        expect(dataset.table[0][0]).to.eql("start");
        expect(dataset.table[0][1]).to.eql("");
        expect(dataset.table[0][2]).to.eql("Windows Vista");
        done();
      });
    });

    it("extraction.json 1", function(done){
      $.getJSON("./unit/data/extraction.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(response.result.length+1);
        expect(dataset.table[0]).to.be.of.length(3);
        expect(dataset.table[0][0]).to.eql("Time");
        expect(dataset.table[0][1]).to.eql("Page");
        expect(dataset.table[0][2]).to.eql("Referrer");
        // expect(dataset.table[1][0]).to.be.eql("2014-04-25T20:38:04.084Z");
        done();
      });
    });

    it("extraction.json 2", function(done){
      $.getJSON("./unit/data/extraction.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(response.result.length+1);
        expect(dataset.table[0]).to.be.of.length(3);
        expect(dataset.table[0][0]).to.eql("keen.timestamp");
        expect(dataset.table[0][1]).to.eql("page");
        expect(dataset.table[0][2]).to.eql("referrer");
        //expect(dataset.table[1][0]).to.be.eql("2014-04-27T04:41:20.573Z");
        done();
      });
    });


    it("extraction-uneven.json", function(done){
      $.getJSON("./unit/data/extraction-uneven.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(response.result.length+1);
        /*expect(dataset.table[0]).to.be.of.length(3);
        expect(dataset.table[0][0]).to.eql("keen.timestamp");
        expect(dataset.table[0][1]).to.eql("page");
        expect(dataset.table[0][2]).to.eql("referrer");*/
        //expect(dataset.table[1][0]).to.be.eql("2014-04-27T04:41:20.573Z");
        done();
      });
    });


    it("extraction-uneven.json SELECT ALL", function(done){
      $.getJSON("./unit/data/extraction-uneven.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
          select: true,
          sort: {
            column: 0,
            order: 'asc'
          }
        });
        console.log('extraction-uneven.json SELECT ALL', dataset);

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(response.result.length+1);
        expect(dataset.table[0]).to.be.of.length(7);
        expect(dataset.table[0][0]).to.eql("keen.timestamp");
        expect(dataset.table[1][1]).to.be.eql(null);
        expect(dataset.table[4][1]).to.be.eql("2014-02-05T21:39:12.155Z");
        done();
      });
    });


    it("funnel.json", function(done){
      $.getJSON("./unit/data/funnel.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "",
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
        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(6);
        expect(dataset.table[0][0]).to.eql("Event");
        expect(dataset.table[0][1]).to.eql("Value");
        expect(dataset.table[1][0]).to.be.eql("Visit");
        expect(dataset.table[1][1]).to.be.eql(42);
        done();
      });
    });



    it("interval-double-groupBy.json", function(done){
      $.getJSON("./unit/data/interval-double-groupBy.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
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
        expect(dataset).to.have.property('table');
        /*expect(dataset.table).to.be.of.length(6);
        expect(dataset.table[0][0]).to.eql("Event");
        expect(dataset.table[0][1]).to.eql("Value");
        expect(dataset.table[1][0]).to.be.eql("Visit");
        expect(dataset.table[1][1]).to.be.eql(42);*/
        done();
      });
    });




  });

});
