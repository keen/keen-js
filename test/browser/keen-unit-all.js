describe("Keen (core)", function() {

  beforeEach(function() {
    this.project = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey,
      writeKey: keenHelper.writeKey
    });
  });

  describe("constructor", function(){
    it("should create a new Keen instance", function(){
      expect(this.project).to.be.an.instanceof(Keen);
    });
    it("should create a new config object", function(){
      expect(this.project.config).to.be.ok;
    });
    it("should create a new config object when config argument is omitted", function(){
      var empty = new Keen();
      expect(empty.config).to.be.ok;
    });
  });

  describe("projectId", function(){

    it("should set the projectId (string)", function() {

      expect(this.project.config)
        .to.have.property('projectId')
        .that.is.a('string')
        .that.equals(keenHelper.projectId);

    });

  });

  describe("readKey", function(){

    it("should set the readKey (string)", function() {
      expect(this.project.config)
        .to.have.property('readKey')
        .that.is.a('string')
        .that.equals(keenHelper.readKey);

    });

  });

  describe("writeKey", function(){

    it("should set the writeKey (string)", function() {
      expect(this.project.config)
        .to.have.property('writeKey')
        .that.is.a('string')
        .that.equals(keenHelper.writeKey);

    });

  });

  describe("protocol", function(){

    it("should default to \"https\" if protocol is absent", function(){

      // Empty
      var keen_empty = new Keen({ projectId: '123' });
      expect(keen_empty.config.protocol).to.equal('https');

    });

    it("should set protocol to \"https\" if designated", function(){

      var keen = new Keen({ projectId: '123', protocol: 'https' });
      expect(keen.config.protocol).to.equal('https');

    });

    it("should set protocol to \"http\" if designated", function(){

      var keen = new Keen({ projectId: '123', protocol: 'http' });
      expect(keen.config.protocol).to.equal('http');

    });

  });

  describe("requestType", function(){

    it("should set request type to \"jsonp\" by default", function(){

      var keen = new Keen({ projectId: '123' });
      expect(keen.config)
        .to.have.property('requestType')
        .that.is.a('string')
        .that.equals('jsonp');

      /*if ('withCredentials' in new XMLHttpRequest()) {
        expect(keen.config)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('xhr');
      } else {
        expect(keen.config)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('jsonp');
      }*/

    });

    // it("should set request type to \"xhr\" if designated and CORS supported, otherwise fall back \"JSONP\"", function(){
    //
    //   var keen = new Keen({ projectId: '123', requestType: 'xhr' });
    //   if ('withCredentials' in new XMLHttpRequest()) {
    //     expect(keen.config)
    //       .to.have.property('requestType')
    //       .that.is.a('string')
    //       .that.equals('xhr');
    //   } else {
    //     expect(keen.config)
    //       .to.have.property('requestType')
    //       .that.is.a('string')
    //       .that.equals('jsonp');
    //   }
    //
    // });

    it("should set request type to \"jsonp\" if designated", function(){

      var keen = new Keen({ projectId: '123', requestType: 'jsonp' });
      expect(keen.config)
        .to.have.property('requestType')
        .that.is.a('string')
        .that.equals('jsonp');

    });

    it("should set request type to \"beacon\" if designated", function(){

      var keen = new Keen({ projectId: '123', requestType: 'beacon' });
      expect(keen.config)
        .to.have.property('requestType')
        .that.is.a('string')
        .that.equals('beacon');

    });

  });

  // describe("Keen.urlMaxLength threshold", function(){
  //   it("should be 2000 for IE, and 16000 otherwise", function(){
  //     if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
  //       expect(Keen.urlMaxLength).to.eql(2000);
  //     } else {
  //       expect(Keen.urlMaxLength).to.eql(16000);
  //     }
  //   });
  // });

});

describe("Keen tracking methods", function() {

  describe("#addEvent", function() {

    describe("Keen.enabled", function(){

      beforeEach(function() {
        this.project = new Keen({ projectId: "123" });
      });

      it("should not send events if set to \"false\"", function(){
        var success = sinon.spy(),
            error = sinon.spy();
        Keen.enabled = false;
        this.project.addEvent("not-going", { test: "data" }, success, error);
        Keen.enabled = true;
        expect(success.calledOnce).not.to.be.ok;
        expect(error.calledOnce).not.to.be.ok;
      });

    });

    describe("enforce correct arguments for #addEvent", function(){

      beforeEach(function() {
        this.project = new Keen({ projectId: "123" });
      });

      it("should return an error message if event collection is omitted", function(){
        var success = sinon.spy(),
            error = sinon.spy();
        this.project.addEvent(null, { test: "data" }, success, error);
        expect(success.calledOnce).not.to.be.ok;
        expect(error.calledOnce).to.be.ok;
      });

    });

    describe("via XHR/CORS (if supported)", function(){

      beforeEach(function() {
        var self = this;
        self.project = new Keen({
          projectId: keenHelper.projectId,
          writeKey: keenHelper.writeKey,
          host: keenHelper.host,
          requestType: 'xhr'
        });
        self.postUrl = self.project.url("/projects/" + self.project.projectId() + "/events/" + keenHelper.collection);
        self.server = sinon.fakeServer.create();
        // self.respondWith = function(code, body){
        //   self.server.respondWith("POST", self.postUrl, [code, { "Content-Type": "application/json"}, body]);
        // };
      });

      afterEach(function(){
        this.server.restore();
      });

      if ('withCredentials' in new XMLHttpRequest()) {

        it("should POST to the API using XHR where CORS is supported", function() {
          var callbacks = [ sinon.spy(), sinon.spy() ];
          this.project.addEvent(keenHelper.collection, keenHelper.properties, callbacks[0], callbacks[1]);
          this.server.respondWith( "POST", this.postUrl,
              [ 200, { "Content-Type": "application/json"}, keenHelper.responses.success ]
            );
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["success"]);
          expect(callbacks[0].calledOnce).to.be.ok;
          expect(callbacks[0].calledWith(JSON.parse(keenHelper.responses["success"]))).to.be.ok;
          expect(callbacks[1].calledOnce).not.to.be.ok;
        });

        it("should call the error callback on error", function() {
          var callbacks = [ sinon.spy(), sinon.spy() ];
          this.project.addEvent(keenHelper.collection, keenHelper.properties, callbacks[0], callbacks[1]);
          this.server.respondWith( "POST", this.postUrl,
              [ 500, { "Content-Type": "application/json"}, keenHelper.responses["error"] ]
            );
          this.server.respond();
          expect(this.server.responses[0].response[2]).to.equal(keenHelper.responses["error"]);
          expect(callbacks[0].calledOnce).not.to.be.ok;
          expect(callbacks[1].calledOnce).to.be.ok;
          // expect(callbacks[1].calledWith(JSON.parse(keenHelper.responses["error"]))).to.be.ok;
        });

      }

    });

    describe("via JSONP to a fake server", function(){

      beforeEach(function() {
        this.project = new Keen({
          projectId: keenHelper.projectId,
          writeKey: keenHelper.writeKey,
          host: keenHelper.host,
          requestType: 'jsonp'
        });
      });

      // it("should add a script tag with a URL that has data and modified params", function(){
      //
      //   this.project.addEvent(keenHelper.collection, keenHelper.properties);
      //   var tag = document.getElementById("keen-jsonp");
      //   expect(tag).to.exist;
      //   expect(tag.src).to.contain("data=");
      //   expect(tag.src).to.contain("modified=");
      //
      // });

    });

    describe("via Image Beacon to a fake server", function(){

      /*
      beforeEach(function() {
        this.project = new Keen({
          projectId: keenHelper.projectId,
          writeKey: keenHelper.writeKey,
          host: keenHelper.host,
          requestType: 'beacon'
        });
      });

      it("should add an image tag", function(){

        var callbacks = [function(){ console.log('here'); }, sinon.spy()];
        this.project.addEvent(keenHelper.collection, keenHelper.properties, callbacks[0], callbacks[1]);

        var tag = document.getElementById("keen-beacon");
        //expect(tag).to.exist;
        //expect(callbacks[0].calledOnce).to.be.ok;

      });
      */

    });

  });
});

describe('Keen.utils', function() {

  it('Should have all public utilities exposed', function() {
    expect(Keen.utils.each).to.exist
      .and.to.be.a('function');
    expect(Keen.utils.extend).to.exist
      .and.to.be.a('function');
    expect(Keen.utils.parseParams).to.exist
      .and.to.be.a('function');
    // expect(Keen.utils.prettyNumber).to.exist
    //   .and.to.be.a('function');
    // expect(Keen.utils.loadScript).to.exist
    //   .and.to.be.a('function');
    // expect(Keen.utils.loadStyle).to.exist
    //   .and.to.be.a('function');
  });

  // describe('#each', function(){
  //   TODO: expand test coverage for these
  // });
  // describe('#extend', function(){});
  // describe('#parseParams', function(){});
  // describe('#prettyNumber', function(){});
  // describe('#loadScript', function(){});
  // describe('#loadStyle', function(){});

});
