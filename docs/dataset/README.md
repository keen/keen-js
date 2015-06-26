# Keen.Dataset

Dataset is a lightweight data structure (two-dimensional array) with a collection of methods for accessing, building and manipulating the data it contains.

Every instance of `Keen.Dataviz` manages its own internal instance of `Keen.Dataset`.

**What does it look like?**

```javascript
[
      [ "index", "Group A"  ],
      [ "r1",        10     ],
      [ "r2",        02     ],
      [ "r3",        23     ],
      [ "r4",        31     ],
      [ "r5",        15     ]
]
```

It's a table! Every Dataset output has a header row, and an index column. These are used as reference points when the methods outlined below are used to create, modify, delete, sort, and filter your data.

**How does this fit into `Keen.Dataviz`?**

`Keen.Dataviz` has internal parsers for all of the most common query response types, so in most cases you won't need to think about how the data is transformed into a `Keen.Dataset` instance and then into a chart.. it just works.

When it's time to jump off the path and visualize something a little more specialized or complex, Dataset is here to make this possible.

```javascript
var chart = new Keen.Dataviz();

// Parses raw data into a new internal Dataset instance
chart
  .parseRawData({ result: 2450 });

// Internal Dataset looks something like this:
/*
[
  [ 'index', 'value' ],
  [ 'result', 2450   ]
]
*/

chart
  .call(function(){
    // Modify internal Dataset instance
    this.dataset.updateColumn(1, function(value, index, column){
      // Divide each value in column 1 by 100
      return value / 100;
    });
  })
  .render();

  // Internal Dataset now looks like this:
  /*
  [
    [ 'index', 'value' ],
    [ 'result', 24.50   ]
  ]
  */
```

## Create a new Dataset instance

```javascript
var ds = new Keen.Dataset();
/*
// New Dataset now looks like this:
[
  [ 'index' ]
]
*/
```

## Set individual cell values

This method was added in keen-js v3.2.6 accepts two specific arguments:

1. An array of Col/Row coordinates: these two values can be string label name ('Group A'), or a numeric index (1)
2. The value to assign to the targeted cell

If the columns or rows provided in the first argument do not exist they will be appended to the table automagically.

```javascript
ds.set(['Group A', 'row 1'], 235);
ds.set(['Group B', 'row 1'], 351);
ds.set(['Group B', 'row 2'], 12);

/*
// New Dataset now looks like this:
[
  [ 'index', 'Group A', 'Group B' ],
  [ 'row 1',  235,       351      ],
  [ 'row 2',  null,      12       ]
]
*/
```

### Select column or row

```javascript
ds.selectRow(2);
ds.selectRow('row 2');
// Either would return [ null, 12 ]

ds.selectColumn(2);
ds.selectColumn('Group B');
// Either would return [ 351, 12 ]
```

### Append column or row

These methods accept two arguments, but only the first is required:

1. Required: The row or column label
2. Optional: An array of values for each cell (omitting this will result in assigning `null` values to each cell)

```javascript
// Populate with known data:
ds.appendRow('row 3', [ 44, 55 ]);
ds.appendColumn('Group C', [ 34, 55 ]);

// ..or populate with null values:
ds.appendRow('row 3');
ds.appendColumn('Group C');

// Populate with logic, supplied with row/col and iterator arguments
ds.appendColumn('Total', function(row, i){
  // This would populate each cell in the new column with a total for that row
  return ds.getRowSum(row);
});

// Shorthand: populate with math helpers directly!
ds.appendRow('Total', ds.getColumnSum);
ds.appendColumn('Total', ds.getRowSum);
```

### Insert a column or row

These methods

```javascript
// Populate with known data
ds.insertRow(1, 'New First Row', [ 23, 44, 33 ]);
ds.insertColumn(1, 'New First Column', [ 44, 22 ]);

// Populate with logic, supplied with row and iterator arguments
ds.insertColumn(1, 'Total in First Column', function(row, i){
  // This would populate each cell in the new column with a total for that row
  return ds.getRowSum(row);
});

// Populate with helpers!
ds.insertRow(1, 'Total in First Row', ds.getColumnSum);
ds.insertColumn(1, 'Total in First Column', ds.getRowSum);
```

### Update each value in a column or row

```javascript
// Populate with known data (complete row)
ds.updateRow(2, [ 22, null, 23 ]);
ds.updateRow('row 2', [ 22, null, 23 ]);

ds.updateColumn(1, [ 44, 21, 34 ]);
ds.updateColumn('Group A', [ 44, 21, 34 ]);

// Access the Header Row
ds.updateRow(0, ['index', 'A', 'B', 'C']);

// Access the Index Column
ds.updateColumn(0, ['index', 1, 2, 3]);

// Update with custom functions
ds.updateRow('row 2', function(value, index, column){
  return value / 100;
});

// Populate with helpers!
ds.updateRow(2, function(value, index, column){
  return ds.getColumnSum(column);
});
ds.updateRow('row 2', function(value, index, column){
  return ds.getColumnSum(column);
});

ds.updateColumn(1, function(value, index, row){
  return ds.getRowSum(row);
});
ds.updateColumn('Group A', function(value, index, row){
  return ds.getRowSum(row);
});
```

### Delete a column or row

```javascript
ds.deleteRow(1);
ds.deleteRow('row 1');

ds.deleteColumn(1);
ds.deleteColumn('Group A');
```
