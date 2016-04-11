var expect = require('chai').expect;

var Keen = require('../../../../../src/core');
var keenHelper = require('../../../helpers/test-config');
var getSetupTemplate = require('../../../../../src/dataviz/adapters/c3/get-setup-template');

describe('#getSetupTemplate', function() {
  beforeEach(function() {
    this.dataviz = new Keen.Dataviz()
  });

  afterEach(function(){
    this.dataviz = null;
  });

  describe('axis.x', function() {

    it('uses custom axis if config exists in chartOptions', function() {
      var axisData = {
        x: { tick: { count: 3 } }
      }
      this.dataviz
        .dataType('cat-chronological')
        .chartOptions({ axis: axisData });

      var setup = getSetupTemplate.call(this.dataviz, 'line');

      expect(setup['axis']).to.deep.equal(axisData);
    });

    it('uses defaults if no user configuration in chartOptions', function() {
      this.dataviz
        .dataType('cat-chronological')
        .dateFormat('%m/%Y')

      var setup = getSetupTemplate.call(this.dataviz, 'line');

      expect(setup['axis']).to.deep.equal({
        x: {
          type: 'timeseries',
          tick: {
            format: '%m/%Y'
          }
        }
      });
    });

  });

});
