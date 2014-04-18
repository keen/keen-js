
  map: {
    root: 'result',
    each: {
      index: 'key -> key -> date',
      value: 'key -> key -> value',
      label: 'key -> label'
    }
  },

  format: {
    index: { type: 'date', sort: 'desc', format: 'MMM D' },
    index: { type: 'string', sort: 'asc', format: 'capitalize' }, // lowercase, uppercase

    index: {
      target: 'timeframe -> start',
      type: 'number',
      sort: 'asc',
      value: '1,000.00', // decimal spaces, commas
      prefix: '$',
      suffix: '!',
      modifier: '*1000'
    },

    value: {
      target: 'value -> result',
      type: 'number',
      format: '1,000.00',
      prefix: '+',
      modifier: '*1000'
    },

    label: {
      target: 'value -> unique_groupBy_field',
      type: 'string',
      sort: 'desc',
      replace: {
        'http://mysite.com/': 'Home page'
      },
      color: {
        'http://mysite.com/': '#ff0000',
        'http://mysite.com/search': '#ccc',
        'http://facebook.com/': 'navy'
      }
    }
  }
