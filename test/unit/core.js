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
