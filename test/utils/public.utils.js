/**
 * Karma test
 * author: Sean Dokko
 * File should contain tests for exposed utility
 * tools.
 */

describe('Utility', function () {

  it('Should have the public utility exposed', function () {
    should.exist(Keen.utils.each);
    should.exist(Keen.utils.extend);
    should.exist(Keen.utils.parseParams);
    should.exist(Keen.utils.prettyNumber);
    should.exist(Keen.utils.loadScript);
    should.exist(Keen.utils.loadStyle);
  });
  
});