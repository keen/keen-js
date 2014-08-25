
describe('Utility', function () {

  it('Should have the public utility exposed', function () {
    expect(Keen.utils.each).to.exist();
    expect(Keen.utils.extend).to.exist();
    expect(Keen.utils.parseParams).to.exist();
    expect(Keen.utils.prettyNumber).to.exist();
    expect(Keen.utils.loadScript).to.exist();
    expect(Keen.utils.loadStyle).to.exist();
  });
  
});