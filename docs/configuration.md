# Configuring the Keen JS client

When instantiating a new Keen JS client, there are a number of possible configuration options. A `projectId` is required at all times, and `writeKey` and `readKey` are required for sending or querying data, respectively.

```javascript
<script type="text/javascript">
  var client = new Keen({
    projectId: "your_project_id",       // String (required)
    writeKey: "your_project_write_key", // String (required for sending data)
    readKey: "your_project_read_key",   // String (required for querying data)
    protocol: "https",                  // String (optional: https | http | auto)
    host: "api.keen.io/3.0",            // String (optional)
    requestType: "jsonp"                // String (optional: jsonp, xhr, beacon)
  });
</script>
```
