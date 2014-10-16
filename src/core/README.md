# Keen client

### Create a new Keen client instance

```javascript
var client = new Keen({
  projectId: "your_project_id",
  readKey: "your_read_key",
  writeKey: "your_write_key",
  requestType: "xhr"
});
```

### .projectId(string) _required_

```javascript
client.projectId("9dv12390sd87f987fs9d97f9s");
client.projectId(); // returns projectId
```

### .readKey(string) _required for querying_

```javascript
client.readKey("9dv3098049081094820897459823072h5jh325283052312390sd87f987fs9d97f9s");
client.readKey(); // returns readKey
```

### .writeKey(string) _required for sending events_

```javascript
client.writeKey("9dv3098049081094820897459823072h5jh325283052312390sd87f987fs9d97f9s");
client.writeKey(); // returns writeKey
```

### .masterKey(string)

```javascript
client.masterKey("83052312390sd87f987fs9d97f9s");
client.masterKey(); // returns masterKey
```

### .url(string)

This method returns a complete base API URL for the current project.

Source:

```javascript
Keen.prototype.url = function(path){
  return this.config.protocol + "://" + this.config.host + "/projects/" + this.projectId() + path;
};

```

Example usage:

```javascript
client.url("/events/pageviews");
  // returns "https://api.keen.io/3.0/projects/<project_id>/events/pageviews"
```
