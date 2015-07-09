# Access Meta Data

## All collections

Retrieve schemas for all collections in a project

```javascript
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  masterKey: "YOUR_MASTER_KEY"
});

var url = 'https://api.keen.io/3.0/projects/YOUR_PROJECT_ID/events';

client.get(url, null, client.masterKey(), function(err, res){
  // if (err) handle the error
  console.log("Returned schema info for " + res.length + " collections");
});
```

Each collection will return a result that looks like this:

```json
{
  "name": "pageview",
  "properties": {
    "keen.created_at": "datetime",
    "keen.id": "string",
    "keen.timestamp": "datetime",
    "another_property": "string",
    "etc": "string"
  },
  "url": "/3.0/projects/<YOUR_PROJECT_ID>/events/<COLLECTION_NAME>"
}
```


## Single collection

```javascript
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  masterKey: "YOUR_MASTER_KEY"
});
var url = 'https://api.keen.io/3.0/projects/YOUR_PROJECT_ID/events/purchases';

client.get(url, null, client.masterKey(), function(err, res){
  // if (err) handle the error
  console.log(res);
});
```

The response will look like this:

```json
{
  "properties": {
    "keen.created_at": "datetime",
    "keen.id": "string",
    "keen.timestamp": "datetime",
    "another_property": "string",
    "etc": "string"
  }

}
```


## All properties from a collection

```javascript
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  masterKey: "YOUR_MASTER_KEY"
});
var url = 'https://api.keen.io/3.0/projects/YOUR_PROJECT_ID/events/purchases/properties';

client.get(url, null, client.masterKey(), function(err, res){
  // if (err) handle the error
  console.log("Returned property info for " + res.length + " properties");
});
```

The response will include an array of objects that look like this:

```json
[
  {
    "property_name": "keen.id",
    "type": "string",
    "url": "/3.0/projects/YOUR_PROJECT_ID/events/purchases/properties/keen.id"
  },
  {},
  {}
]
```

## Single property from a collection

```javascript
var client = new Keen({
  projectId: "YOUR_PROJECT_ID",
  masterKey: "YOUR_MASTER_KEY"
});
var url = 'https://api.keen.io/3.0/projects/YOUR_PROJECT_ID/events/purchases/properties/keen.id';

client.get(url, null, client.masterKey(), function(err, res){
  // if (err) handle the error
  console.log(res);
});
```

The response will look like this (same as a single result from the previous example):

```json
{
  "property_name": "keen.id",
  "type": "string",
  "url": "/3.0/projects/YOUR_PROJECT_ID/events/purchases/properties/keen.id"
}
```
