# Dataset API

### Select Row or Column
```
ds.selectRow(12);
ds.selectRow("2014-09-24");
ds.selectColumn(12);
ds.selectColumn("A");
```

### Append Row or Column

```
// Populate with known data
ds.appendRow("2014-09-24", [1,2,3,4,5]);
ds.appendColumn("A", [1,2,3,4,5]);

// Populate with math helpers!
ds.appendRow("Total", ds.getColumnSum);
ds.appendColumn("Total", ds.getRowSum);
```

### Insert Row or Column

```
// Populate with known data
ds.insertRow(12, "2014-09-24", [1,2,3,4,5]);
ds.insertColumn(12, "A", [1,2,3,4,5]);

// Populate with helpers!
ds.insertRow(1, "Total", ds.getColumnSum);
ds.insertColumn(12, "Total", ds.getRowSum);
```


### Update each value in a Row or Column

```
// Populate with known data (complete row)
ds.updateRow(12, [1,2,3,4,5]);
ds.updateRow("2014-09-24", [1,2,3,4,5]);
ds.updateColumn(12, [1,2,3,4,5]);
ds.updateColumn("A", [1,2,3,4,5]);

// Access the Header Row
ds.updateRow(0, ["Index", "A", "B", "C"]);

// Access the Index Column
ds.updateColumn(0, [0, 1, 2, 3]);

// Update with custom functions
ds.updateRow("2014-10-18", function(value, index, column){
  // return value.toFixed(4);
	return i == 0 ? new Date(value) : this.getColumnSum(column);
});

// Populate with helpers!
ds.updateRow(12, function(value, index, column){
  return ds.getColumnSum(column);
});
ds.updateRow("2014-09-24", function(value, index, column){
  return ds.getColumnSum(column);
});

ds.updateColumn(12, function(value, index, row){
  return ds.getRowSum(row);
});
ds.updateColumn("A", function(value, index, row){
  return ds.getRowSum(row);
});
```

### delete Row or Column

```
ds.deleteRow(12);
ds.deleteRow("2014-09-24");
ds.deleteColumn(12);
ds.deleteColumn("A");
```
