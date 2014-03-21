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
console.log(keenHelper);

describe("Keen Client", function() {
  
  beforeEach(function() {
    this.keen = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readyKey,
      writeKey: keenHelper.writeKey
    });
  });
  
  describe("constructor", function() {
    
    it("should error if no configuration object", function() {
      expect(function() {
        (keen = new Keen());
      }).to.throw(Error);
    });
    
    it("should create a new client instance", function(){
      expect(this.keen.client).to.be.ok;
    });
    
    describe("validate projectId", function(){
      
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
      
      it("should set the projectId correctly", function() {
        
        expect(this.keen.client.projectId).to.equal(keenHelper.projectId);
        
      });
      
    });
    
    describe("validate readKey", function(){
      
      it("should set the readKey", function() {
        expect(this.keen.client.readyKey).to.equal(keenHelper.readyKey);
      });
      
    });
    
    describe("validate readKey", function(){
      
      it("should set the writeKey", function() {
        expect(this.keen.client.writeKey).to.equal(keenHelper.writeKey);
      });
      
    });
    
    
    
  });
});