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
