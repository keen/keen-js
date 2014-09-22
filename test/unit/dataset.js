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

    it("keen_groupby.json (pie!)", function(done){
      $.getJSON("./unit/data/keen_groupby.json", function(response) {
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
        console.log('keen_groupby.json', dataset);

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(56);
        expect(dataset.table[0]).to.be.of.length(2);
        expect(dataset.table[0][0]).to.eql("page");
        expect(dataset.table[0][1]).to.eql("result");
        done();
      });
    });

    it("keen2.json", function(done){
      $.getJSON("./unit/data/keen2.json", function(response) {
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
        console.log('keen2.json', dataset);

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(7);
        expect(dataset.table[0]).to.be.of.length(3);
        expect(dataset.table[0][0]).to.eql("start");
        expect(dataset.table[0][1]).to.eql("");
        expect(dataset.table[0][2]).to.eql("Windows Vista");
        done();
      });
    });

    // it("keen.json 1 (columns sorted DESC)", function(done){
    //   $.getJSON("./unit/data/keen.json", function(response) {
    //     var dataset = new Keen.Dataset(response, {
    //       collection: "result",
    //       unpack: {
    //         index: "timeframe -> start",
    //         value: "value -> result -> number -> value",
    //         label: "value -> page"
    //       },
    //       sort: {
    //         index: 'asc',
    //         value: 'desc'
    //       }
    //     });
    //     console.log('keen.json 1', dataset);
    //
    //     expect(dataset).to.have.property('table');
    //     expect(dataset.table).to.be.of.length(3);
    //     expect(dataset.table[0]).to.be.of.length(4);
    //     expect(dataset.table[0][0]).to.eql("start");
    //     expect(dataset.table[0][1]).to.eql("contact");
    //     expect(dataset.table[0][2]).to.eql("home");
    //     expect(dataset.table[0][3]).to.eql("about");
    //     done();
    //   });
    // });

    // it("keen.json 2 (columns sorted ASC)", function(done){
    //   $.getJSON("./unit/data/keen.json", function(response) {
    //     var dataset = new Keen.Dataset(response, {
    //       collection: "result",
    //       unpack: {
    //         index: "timeframe -> start",
    //         value: "value -> result -> number -> value",
    //         label: "value -> page"
    //       },
    //       sort: {
    //         index: 'asc',
    //         value: 'asc'
    //       }
    //     });
    //     console.log('keen.json 2', dataset);
    //
    //     expect(dataset).to.have.property('table');
    //     expect(dataset.table).to.be.of.length(3);
    //     expect(dataset.table[0]).to.be.of.length(4);
    //     expect(dataset.table[0][0]).to.eql("start");
    //     expect(dataset.table[0][1]).to.eql("about");
    //     expect(dataset.table[0][2]).to.eql("home");
    //     expect(dataset.table[0][3]).to.eql("contact");
    //     done();
    //   });
    // });

    // it("Rows sorted according to index: asc/desc (twitter.json)", function(done){
    //   $.getJSON("./unit/data/twitter.json", function(response) {
    //     var dataset1 = new Keen.Dataset(response, {
    //       collection: "",
    //       unpack: {
    //         index: "created_at",
    //         value: "text",
    //         label: "user -> screen_name"
    //       },
    //       sort: {
    //         index: 'asc'
    //       }
    //     });
    //     var dataset2 = new Keen.Dataset(response, {
    //       collection: "",
    //       unpack: {
    //         index: {
    //           path: "created_at"
    //         },
    //         value: {
    //           path: "text",
    //           type: "string",
    //           prefix: "SITE: ",
    //           format: "uppercase"
    //         },
    //         label: {
    //           path: "user -> screen_name",
    //           prefix: "@"
    //         }
    //       },
    //       sort: {
    //         index: 'desc'
    //       }
    //     });
    //     console.log('twitter.json', dataset1);
    //     console.log('twitter.json', dataset2);
    //
    //     expect(dataset1).to.have.property('table');
    //
    //     expect(dataset1.table).to.be.of.length(3);
    //     expect(dataset1.table[0]).to.be.of.length(2);
    //     expect(dataset1.table[0][0]).to.eql("created_at");
    //     expect(dataset1.table[0][1]).to.eql("larimer");
    //     expect(dataset1.table[1][0]).to.be.eql('Tue Mar 25 17:39:38 +0000 2014');
    //
    //     expect(dataset2.table).to.be.of.length(3);
    //     expect(dataset2.table[0]).to.be.of.length(2);
    //     expect(dataset2).to.have.property('table');
    //     expect(dataset2.table[0][0]).to.eql("created_at");
    //     expect(dataset2.table[0][1]).to.eql("@larimer");
    //     expect(dataset2.table[1][0]).to.be.eql('Tue Mar 25 20:19:50 +0000 2014');
    //     done();
    //   });
    // });

    // it("External method call (twitter.json)", function(done){
    //   $.getJSON("./unit/data/twitter.json", function(response) {
    //     window.Twitter = {
    //       DateFixer: function(str, opt) {
    //         var parsed = Date.parse(str);
    //         var date = new Date(parsed);
    //         return date;
    //       }
    //     };
    //     var dataset = new Keen.Dataset(response, {
    //       collection: "",
    //       unpack: {
    //         index: {
    //           path: "created_at",
    //           type: "date",
    //           method: "Twitter.DateFixer",
    //           format: "MMM DD, YYYY"
    //         },
    //         value: "text",
    //         label: "user -> screen_name"
    //       },
    //       sort: {
    //         index: 'desc'
    //       }
    //     });
    //     console.log('twitter.json Ext Method', dataset);
    //
    //     expect(dataset).to.have.property("table");
    //     expect(dataset.table).to.be.of.length(3);
    //     expect(dataset.table[0]).to.be.of.length(2);
    //     expect(dataset.table[0][0]).to.eql("created_at");
    //     expect(dataset.table[0][1]).to.eql("larimer");
    //     expect(dataset.table[1][0]).to.be.eql("Mar 25, 2014");
    //     done();
    //   });
    // });

    it("keen_metric.json", function(done){
      $.getJSON("./unit/data/keen_metric.json", function(response) {
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
        console.log('keen_metric.json', dataset);

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(2);
        expect(dataset.table[0][0]).to.eql("Metric");
        expect(dataset.table[1][0]).to.eql("$2,450.00 per month");
        done();
      });
    });

    it("keen_extraction.json 1", function(done){
      $.getJSON("./unit/data/keen_extraction.json", function(response) {
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
        console.log('keen_extraction.json 1', dataset);

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

    it("keen_extraction.json 2", function(done){
      $.getJSON("./unit/data/keen_extraction.json", function(response) {
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
        console.log('keen_extraction.json 2', dataset);

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


    it("keen_uneven_extraction.json", function(done){
      $.getJSON("./unit/data/keen_uneven_extraction.json", function(response) {
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
        console.log('keen_uneven_extraction.json', dataset);

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


    it("keen_uneven_extraction.json SELECT ALL", function(done){
      $.getJSON("./unit/data/keen_uneven_extraction.json", function(response) {
        var dataset = new Keen.Dataset(response, {
          collection: "result",
          select: true,
          sort: {
            column: 0,
            order: 'asc'
          }
        });
        console.log('keen_uneven_extraction.json SELECT ALL', dataset);

        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(response.result.length+1);
        expect(dataset.table[0]).to.be.of.length(7);
        expect(dataset.table[0][0]).to.eql("keen.timestamp");
        expect(dataset.table[1][1]).to.be.eql(null);
        expect(dataset.table[4][1]).to.be.eql("2014-02-05T21:39:12.155Z");
        done();
      });
    });


    it("keen_funnel.json", function(done){
      $.getJSON("./unit/data/keen_funnel.json", function(response) {
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
        console.log('keen_funnel.json', dataset);
        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(6);
        expect(dataset.table[0][0]).to.eql("Event");
        expect(dataset.table[0][1]).to.eql("Value");
        expect(dataset.table[1][0]).to.be.eql("Visit");
        expect(dataset.table[1][1]).to.be.eql(42);
        done();
      });
    });



    it("keen_2xgroupby.json", function(done){
      $.getJSON("./unit/data/keen_2xgroupby.json", function(response) {
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
        console.log('keen_2xgroupby.json', dataset);
        expect(dataset).to.have.property('table');
        /*expect(dataset.table).to.be.of.length(6);
        expect(dataset.table[0][0]).to.eql("Event");
        expect(dataset.table[0][1]).to.eql("Value");
        expect(dataset.table[1][0]).to.be.eql("Visit");
        expect(dataset.table[1][1]).to.be.eql(42);*/
        done();
      });
    });


    it("keen_empty.json", function(done){
      $.getJSON("./unit/data/keen_empty.json", function(response) {
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
        console.log('keen_empty.json', dataset);
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

    it("keen_grouped_interval_booleans.json", function(done){
      $.getJSON("./unit/data/keen_grouped_interval_booleans.json", function(response) {
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
        console.log('keen_grouped_interval_booleans.json', dataset);
        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(7);
        done();
      });
    });


    it("keen_grouped_booleans.json", function(done){
      $.getJSON("./unit/data/keen_grouped_booleans.json", function(response) {
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
        console.log('keen_grouped_booleans.json', dataset);
        expect(dataset).to.have.property('table');
        expect(dataset.table).to.be.of.length(4);
        expect(dataset.table[1][0]).to.eql("true");
        expect(dataset.table[2][0]).to.eql("false");
        done();
      });
    });

  });

});
