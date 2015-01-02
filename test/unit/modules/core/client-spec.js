var expect = require("chai").expect;

var Keen = require("../../../../src/core"),
    keenHelper = require("../../helpers/test-config");

describe("Client", function() {

  beforeEach(function() {
    this.project = new Keen({
      projectId  : keenHelper.projectId,
      readKey    : keenHelper.readKey,
      writeKey   : keenHelper.writeKey,
      masterKey  : keenHelper.masterKey
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

  describe("#configure", function(){

    describe("protocol", function(){
      it("should default to \"https\" if protocol is absent", function(){
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
      });
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

  });

  describe("#projectId", function(){
    it("should set the projectId (string)", function() {
      expect(this.project.config)
        .to.have.property('projectId')
        .that.is.a('string')
        .that.equals(keenHelper.projectId);
    });
    it("should remove the projectId by passing null", function(){
      var client = new Keen({ projectId: "123" });
      client.projectId(null);
      expect(client.config.projectId).to.not.exist;
    });
  });

  describe("#readKey", function(){
    it("should set the readKey (string)", function() {
      expect(this.project.config)
        .to.have.property('readKey')
        .that.is.a('string')
        .that.equals(keenHelper.readKey);
    });
    it("should remove the readKey by passing null", function(){
      var client = new Keen({ readKey: "123" });
      client.readKey(null);
      expect(client.config.readKey).to.not.exist;
    });
  });

  describe("#writeKey", function(){
    it("should set the writeKey (string)", function() {
      expect(this.project.config)
        .to.have.property('writeKey')
        .that.is.a('string')
        .that.equals(keenHelper.writeKey);
    });
    it("should remove the writeKey by passing null", function(){
      var client = new Keen({ writeKey: "123" });
      client.writeKey(null);
      expect(client.config.writeKey).to.not.exist;
    });
  });

  describe("#masterKey", function(){
    it("should set the masterKey (string)", function() {
      expect(this.project.config)
      .to.have.property('masterKey')
      .that.is.a('string')
      .that.equals(keenHelper.masterKey);
    });
    it("should remove the masterKey by passing null", function(){
      var client = new Keen({ masterKey: "123" });
      client.masterKey(null);
      expect(client.config.masterKey).to.not.exist;
    });
  });

});
