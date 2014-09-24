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

// Populate with math helpers!
ds.insertRow(1, "Total", ds.getColumnSum);
ds.insertColumn(12, "Total", ds.getRowSum);
```

### Update a Row or Column
```
// Populate with known data
ds.updateRow(12, [1,2,3,4,5]);
ds.updateRow("2014-09-24", [1,2,3,4,5]);
ds.updateColumn(12, [1,2,3,4,5]);
ds.updateColumn("A", [1,2,3,4,5]);

// Populate with helpers!
ds.updateRow(12, ds.getColumnSum);
ds.updateRow("2014-09-24", ds.getColumnSum);
ds.updateColumn(12, ds.getRowSum);
ds.updateColumn("A", ds.getRowSum);

// Access the Header Row
ds.updateRow(0, ["Index", "A", "B", "C"]);

// Access the Index Column
ds.updateColumn(0, [0, 1, 2, 3]);

// Update with custom functions
ds.updateRow(0, function(colSet, colIndex){
  /* access an array of current column values
     for each cell in the new row */
  return "New Label";
})
```

### delete Row or Column

```
ds.deleteRow(12);
ds.deleteRow("2014-09-24");
ds.deleteColumn(12);
ds.deleteColumn("A");
```
