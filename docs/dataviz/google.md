# Google Charts Dataviz Adapter

Google Charts is currently the default visualization library for this SDK, and is loaded automatically from Google's JSAPI.

### Date formatting

Date formatting is possible by passing either a string or function to `dateFormat`. These possible values are handled in the following way:
* String values will be applied as the pattern for a `google.visualization.DateFormat` formatter.
* Function values will be called with the Google `DataTable` instance as an argument, which can then be formatted however necessary. This `DataTable` instance must also be returned (example below).

```javascript
// Client shorthand
client.draw(query, element, {
  // string:
  dateFormat: 'MMM d, yyyy',
  // or function:
  dateFormat: function(datatable){
    // Do stuff to the datatable
    return datatable;
  }
});

// Dataviz instance
var chart = new Keen.Dataviz()
  .el(element)
  // string:
  .dateFormat('MMM d, yyyy')
  // or function:
  .dateFormat(function(datatable){
    var dateFormatter = new google.visualization.DateFormat({
      pattern: 'MMM d, yyyy'
    });
    dateFormatter.format(datatable, 0);
    return datatable;
  })
  .render();
```

Custom date formatting is also possible by bypassing the `.render()` function and interacting with Google Charts library directly, as demonstrated in this [jsFiddle](http://jsfiddle.net/keen/bq6rovjd/).

Supported chart types and links to their configuration options are available [here](../visualization.md).
