var expect = require("chai").expect;

var Keen = require("../../../../src/server"),
    keenHelper = require("../../helpers/test-config");

describe("Scoped Keys", function(){

  beforeEach(function() {
    this.client = new Keen({
      projectId  : keenHelper.projectId,
      masterKey  : keenHelper.masterKey
    });
  });

  it("should encrypt a scoped key with given options", function() {

    var options = {
      "allowed_operations": ["read"],
      "filters": [ {
        "property_name": "purchase.amount",
        "operator": "eq",
        "property_value": 56
      }, {
        "property_name": "purchase.name",
        "operator": "ne",
        "property_value": "Barbie"
      }]
    };
    // Encrypt a scoped key..
    var scopedKey = Keen.utils.encryptScopedKey(this.client.masterKey(), options);
    // ..then decrypt it
    var decryptedOptions = Keen.utils.decryptScopedKey(this.client.masterKey(), scopedKey);
    expect(decryptedOptions).to.deep.equal(options);
  });

  it("should decrypt a scoped key and return the correct options", function() {

    var apiKey = "f5d7c745ba4f437a82db02ca8b416556";
    var scopedKey = "7b8f357fa55e35efb2f7fa51a03ec2835c5537e57457c5a7c1c40c454fc00d5addef7ed911303fc2fa9648d3ae13e638192b86e90cd88657c9dc5cf03990cbf6eb2a7994513d34789bd25447f3dccaf5a3de3b9cacf6c11ded581e0506fca147ea32c13169787bbf8b4d3b8f2952bc0bea1beae3cfbbeaa1f421be2eac4cc223";
    var options = {
      "filters": [{
        "property_name": "account_id",
        "operator": "eq",
        "property_value": "4d9a4c421d011c553e000001"
      }]
    };
    var decryptedOptions = Keen.utils.decryptScopedKey(apiKey, scopedKey);
    expect(decryptedOptions).to.deep.equal(options);
  });

});
