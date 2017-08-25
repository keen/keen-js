var expect = require("chai").expect;

var Keen = require("../../../../src/server"),
    keenHelper = require("../../helpers/test-config");

describe("Scoped Keys", function(){

  beforeEach(function(){
    this.client = new Keen({
      // host: 'server-js.keen.io/3.0'
    });
  });

  describe("New key validation", function(){

    beforeEach(function(){
      this.projectId = '545178efe8759674b94a47d4';
      this.apiKey = '78AFA8B8FF164C2429590C48F74C26165D37C8B95B5DFC71E498A32C57C9C38E';
      this.query = new Keen.Query('count', {
        event_collection: 'Test',
        timeframe: {
          start: '2014-10-01',
          end: '2014-11-01'
        }
      });
      this.keyOptions = {
        "allowed_operations": ["read"],
        "filters": [
          {
            "property_name": "foo",
            "operator": "exists",
            "property_value": true
          }
        ]
      };
    });

    it("should encrypt a scoped key with given options", function() {
      // Encrypt a scoped key..
      var scopedKey = Keen.utils.encryptScopedKey(this.apiKey, this.keyOptions);
      // ..then decrypt it
      var decryptedOptions = Keen.utils.decryptScopedKey(this.apiKey, scopedKey);
      expect(decryptedOptions).to.deep.equal(this.keyOptions);
    });

    it("should decrypt a scoped key and return the correct options", function() {
      var scopedKey = Keen.utils.encryptScopedKey(this.apiKey, this.keyOptions);
      var decryptedOptions = Keen.utils.decryptScopedKey(this.apiKey, scopedKey);
      expect(decryptedOptions).to.deep.equal(this.keyOptions);
    });

  });

  describe("Legacy key validation", function(){

    beforeEach(function(){
      this.projectId = '52f00ec205cd66404b000000';
      this.apiKey = 'FC135394DD08E3976870B7E7E83BDCD8';
      this.query = new Keen.Query('count', {
        event_collection: 'click',
        timeframe: {
          start: '2015-01-01',
          end: '2016-01-01'
        }
      });
      this.keyOptions = {
        "allowed_operations": ["read"],
        "filters": [
          {
            "property_name": "page",
            "operator": "exists",
            "property_value": true
          }
        ]
      };
    });

    it("should encrypt an old scoped key with given options", function() {
      // Encrypt a scoped key..
      var scopedKey = Keen.utils.encryptScopedKey(this.apiKey, this.keyOptions);
      // ..then decrypt it
      var decryptedOptions = Keen.utils.decryptScopedKey(this.apiKey, scopedKey);
      expect(decryptedOptions).to.deep.equal(this.keyOptions);
    });

    it("should decrypt an old scoped key and return the correct options", function() {
      var scopedKey = Keen.utils.encryptScopedKey(this.apiKey, this.keyOptions);
      var decryptedOptions = Keen.utils.decryptScopedKey(this.apiKey, scopedKey);
      expect(decryptedOptions).to.deep.equal(this.keyOptions);
    });

  });

});
