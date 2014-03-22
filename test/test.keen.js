var expect = chai.expect;

var keenHelper = {
  projectId: '5235435645bf82348762',
  writeKey: '43232342f234g234234',
  readKey: '42352gkjhgj1g2424',
  protocol: 'https',
  host: 'api.keen.io/9999/3.0',
  collection: 'mocha',
  properties: { username: 'keenio', color: 'blue' },
  responses: {
    success: '{\"created\": true }',
    error: '{\"error\": true }'
  }
};
//console.log(keenHelper);

describe("Keen Client", function() {
  
  beforeEach(function() {
    this.keen = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey,
      writeKey: keenHelper.writeKey
    });
  });
  
  describe("constructor", function() {
    
    it("should create a new Keen instance", function(){
      expect(this.keen).to.be.an.instanceof(Keen);
    });
    
    it("should error if no configuration object", function() {
      expect(function() {
        (keen = new Keen());
      }).to.throw(Error);
    });
    
    it("should create a new client object", function(){
      expect(this.keen.client).to.be.ok;
    });
    
    describe("validates projectId", function(){
      
      it("should error if projectId is absent", function() {

        expect(function() {
          (keen = new Keen());
        }).to.throw(Error);
        
      });
      
      it("should error if projectId is empty", function() {
      
        expect(function() {
          (keen = new Keen({projectId:''}));
        }).to.throw(Error);
        
      });
      
      it("should error if projectId is of incorrect type", function() {
        
        // Number
        expect(function() {
          (keen = new Keen({projectId:0}));
        }).to.throw(Error);
        
        // Boolean
        expect(function() {
          (keen = new Keen({projectId:false}));
        }).to.throw(Error);
        
        // Array
        expect(function() {
          (keen = new Keen({projectId:['array']}));
        }).to.throw(Error);
        
        // Object
        expect(function() {
          (keen = new Keen({projectId:{}}));
        }).to.throw(Error);
        
      });
      
      it("should set the projectId (string)", function() {
        
        expect(this.keen.client)
          .to.have.property('projectId')
          .that.is.a('string')
          .that.equals(keenHelper.projectId);
        
      });
      
    });
    
    describe("validates readKey", function(){
      
      it("should set the readKey (string)", function() {
        expect(this.keen.client)
          .to.have.property('readKey')
          .that.is.a('string')
          .that.equals(keenHelper.readKey);
          
      });
      
    });
    
    describe("validates readKey", function(){
      
      it("should set the writeKey (string)", function() {
        expect(this.keen.client)
          .to.have.property('writeKey')
          .that.is.a('string')
          .that.equals(keenHelper.writeKey);
        
      });
      
    });
    
    describe("validates endpoint", function(){
      
      it("should default to \"https\" if protocol is absent or of incorrect type", function(){
        
        // Empty
        var keen_empty = new Keen({ projectId: '123', protocol: '' });
        expect(keen_empty.client.endpoint.indexOf('https://')).to.equal(0);
        
        // Number
        var keen_number = new Keen({ projectId: '123', protocol: 0 });
        expect(keen_number.client.endpoint.indexOf('https://')).to.equal(0);
        
        // Boolean
        var keen_boolean = new Keen({ projectId: '123', protocol: true });
        expect(keen_boolean.client.endpoint.indexOf('https://')).to.equal(0);
        
        // Array
        var keen_array = new Keen({ projectId: '123', protocol: [] });
        expect(keen_array.client.endpoint.indexOf('https://')).to.equal(0);
        
        // Object
        var keen_object = new Keen({ projectId: '123', protocol: {} });
        expect(keen_object.client.endpoint.indexOf('https://')).to.equal(0);
        
      });
      
      it("should set protocol to \"https\" if designated", function(){
        
        var keen = new Keen({ projectId: '123', protocol: 'https' });
        expect(keen.client.endpoint.indexOf('https://')).to.equal(0);
        
      });
      
      it("should set protocol to \"http\" if designated", function(){
        
        var keen = new Keen({ projectId: '123', protocol: 'http' });
        expect(keen.client.endpoint.indexOf('http://')).to.equal(0);
        
      });
      
    });
    
    describe("validates request type", function(){
      
      it("should set request type to \"xhr\" by default", function(){

        var keen = new Keen({ projectId: '123', requestType: 'xhr' });
        expect(keen.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('xhr');
        
      });
      
      it("should set request type to \"jsonp\" if designated", function(){
        
        var keen = new Keen({ projectId: '123', requestType: 'jsonp' });
        expect(keen.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('jsonp');
        
      });
      
      it("should set request type to \"beacon\" if designated", function(){
        
        var keen = new Keen({ projectId: '123', requestType: 'beacon' });
        expect(keen.client)
          .to.have.property('requestType')
          .that.is.a('string')
          .that.equals('beacon');
        
      });
      
    });
    
  });
});