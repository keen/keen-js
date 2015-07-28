var expect = require('chai').expect;

var Keen = require('../../../../src/core'),
    keenHelper = require('../../helpers/test-config');

describe('Keen.DataTypeParser', function(){
  beforeEach(function() {
    this.project = new Keen({
      projectId: keenHelper.projectId,
      readKey: keenHelper.readKey
    });
    this.query = new Keen.Query('count', {
      eventCollection: 'test-collection'
    });
    this.dataviz = new Keen.Dataviz();
  });
  afterEach(function(){
    this.project = null;
    this.query = null;
    this.dataviz = null;
  });

  describe('#parse', function(){
    it('parses a singular data type', function(){
      var response = { result: 123 };

      this.dataviz.parseRawData(response);

      expect(this.dataviz.dataType()).to.equal('singular');
      expect(this.dataviz.dataset.schema()).to.deep.equal({
        records: '',
        select: [{
          path: 'result',
          type: 'string',
          label: 'Metric'
        }]
      });
      expect(this.dataviz.dataset.output()).to.deep.equal([
        ['Metric', 'value'], ['result', 123]
      ]);
    });

    it('parses select unique', function() {
      var response = {
        'result': ['bob@aol.com', 'joe@yahoo.biz', 'travis@gmail.com']
      };

      this.dataviz.parseRawData(response);

      expect(this.dataviz.dataType()).to.equal('nominal');
      expect(this.dataviz.dataset.output()).to.deep.equal([
        ['index', 'unique values'],
        ['bob@aol.com', null],
        ['joe@yahoo.biz', null],
        ['travis@gmail.com', null]
      ]);
    });

    it('parses group by', function() {
      var response = {
        'result': [
          { 'user.email': 'user1@keen.io', 'result': 39 },
          { 'user.email': 'user2@keen.io', 'result': 27 }
        ]
      };

      this.dataviz.parseRawData(response);

      expect(this.dataviz.dataType()).to.equal('categorical');
      expect(this.dataviz.dataset.schema()).to.deep.equal({
        records: 'result', select: [
        {
          'path': 'user.email',
          'type': 'string'
        },
        {
          'path': 'result',
          'type': 'number'
        }
        ]
      });
      expect(this.dataviz.dataset.output()).to.deep.equal([
        ['user.email', 'result'],
        ['user1@keen.io', 39],
        ['user2@keen.io', 27]
      ]);
    });
  });

  it('parses single interval', function() {
    var response = {
      'result': [
        {
          'timeframe': {
            'start': '2014-08-23T00:00:00.000Z',
            'end': '2014-08-24T00:00:00.000Z'
          },
          'value': 2
        },
        {
          'timeframe': {
            'start': '2014-08-25T00:00:00.000Z',
            'end': '2014-08-26T00:00:00.000Z'
          },
          'value': 9
        }
      ]
    }; 

    this.dataviz.parseRawData(response);

    expect(this.dataviz.dataType()).to.equal('chronological');
    expect(this.dataviz.dataset.schema()).to.deep.equal({
      records: 'result',
      select: [
        { path: 'timeframe -> start', type: 'date' },
        { path: 'value', type: 'number' }
      ]
    });
  });

  it('parses grouped interval', function() {
    var response = {
      'result': [
        {
          'timeframe': {
            'start': '2014-08-22T00:00:00.000Z',
            'end': '2014-08-23T00:00:00.000Z'
          },
          'value': [
            { 'user.email': 'ryan@keen.io', 'result': 3 },
            { 'user.email': 'dan@keen.io', 'result': 2 },
            { 'user.email': 'kirk@keen.io', 'result': 1 }
          ]
        },
        {
          'timeframe': {
            'start': '2014-08-23T00:00:00.000Z',
            'end': '2014-08-24T00:00:00.000Z'
          },
          'value': [
            { 'user.email': 'ryan@keen.io', 'result': 0 },
            { 'user.email': 'dan@keen.io', 'result': 1 },
            { 'user.email': 'kirk@keen.io', 'result': 1 }
          ]
        }
      ]
    };

    this.dataviz.parseRawData(response);

    expect(this.dataviz.dataType()).to.equal('cat-chronological');
    expect(this.dataviz.dataset.schema()).to.deep.equal({
      records: 'result',
      unpack: {
        index: {
          path: 'timeframe -> start',
          type: 'date'
        },
        label: {
          path: 'value -> user.email',
          type: 'string'
        },
        value: {
          path: 'value -> result',
          type: 'number'
        }
      }
    });
  });

  it('parses funnel', function() {
    var response = {
      'result': [
        3,
        1,
        0
      ],
      'steps': [
      {
        'actor_property': 'visitor.guid',
        'event_collection': 'signed up',
        'timeframe': 'this_7_days'
      },
      {
        'actor_property': 'user.guid',
        'event_collection': 'completed profile',
        'timeframe': 'this_7_days'
      },
      {
        'actor_property': 'user.guid',
        'event_collection': 'referred user',
        'timeframe': 'this_7_days'
      }
      ]
    };

    this.dataviz.parseRawData(response);

    expect(this.dataviz.dataType()).to.equal('cat-ordinal');
    expect(this.dataviz.dataset.schema()).to.deep.equal({
      records: '',
      unpack: {
        index: {
          path: 'steps -> event_collection',
          type: 'string'
        },
        value: {
          path: 'result -> ',
          type: 'number'
        }
      }
    });
    expect(this.dataviz.dataset.output()).to.deep.equal([
      ['event_collection', 'Value'],
      ['signed up', 3],
      ['completed profile', 1],
      ['referred user', 0]
    ]);
  });

  it('parses extraction', function() {
    var response = {
      'result': [
        {
          'keen': {
            'created_at': '2012-07-30T21:21:46.566000+00:00',
            'timestamp': '2012-07-30T21:21:46.566000+00:00',
            'id': ''
          },
          'user': {
            'email': 'dan@keen.io',
            'id': '4f4db6c7777d66ffff000000'
          },
          'user_agent': {
            'browser': 'chrome',
            'browser_version': '20.0.1132.57',
            'platform': 'macos'
          }
        },
        {
          'keen': {
            'created_at': '2012-07-30T21:40:05.386000+00:00',
            'timestamp': '2012-07-30T21:40:05.386000+00:00',
            'id': ''
          },
          'user': {
            'email': 'michelle@keen.io',
            'id': '4fa2cccccf546ffff000006'
          },
          'user_agent': {
            'browser': 'chrome',
            'browser_version': '20.0.1132.57',
            'platform': 'macos'
          }
        }
      ]
    };

    this.dataviz.parseRawData(response);

    expect(this.dataviz.dataType()).to.equal('extraction');
    expect(this.dataviz.dataset.schema()).to.deep.equal({
      records: 'result', select: true
    });
  });
});
