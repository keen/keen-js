var expect = require("chai").expect;

var Keen = require("../../../../src/server"),
    keenHelper = require("../../helpers/test-config");

describe("Scoped Keys", function(){

  beforeEach(function(){
    this.keyOptions = {
      "allowed_operations": ["read"],
      "filters": [
        {
          "property_name": "purchase.amount",
          "operator": "eq",
          "property_value": 56
        },
        {
          "property_name": "purchase.name",
          "operator": "ne",
          "property_value": "Barbie"
        }
      ]
    };
  });

  describe("New key validation", function(){

    beforeEach(function(){
      this.apiKey = '78AFA8B8FF164C2429590C48F74C26165D37C8B95B5DFC71E498A32C57C9C38E';
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

  describe("Legacy key validation", function(){

    beforeEach(function(){
      this.apiKey = 'FC135394DD08E3976870B7E7E83BDCD8';
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
