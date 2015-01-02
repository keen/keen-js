# Scoped Keys (server-only)

Scoped keys let you safely expose data to a specific user, without giving away access to an entire event collection. This functionality is only supported on the server.

Scoped Keys are generated with your Master API key. Each key defines allowed operations (read/write), along with a set of immutable filters that are applied to every request.

### Configuration

```json
{
  "allowed_operations": [ "read", "write" ],
  "filters": [
    {
      "property_name": "account_id",
      "operator": "eq",
      "property_value": 123
    }
  ]
}
```

## Create a scoped key

```javascript
var Keen = require("keen-js");
var apiKey = "YOUR_MASTER_KEY";

var scopedKey = Keen.utils.encryptScopedKey(apiKey, {
  "allowed_operations": ["read"],
  "filters": [{
    "property_name": "account.id",
    "operator": "eq",
    "property_value": "123"
  }]
});

// Do something with this new scoped key
var client = Keen.configure({
  projectId: "<project_id>";
  readKey: scopedKey
});
```

## Decrypt a scoped key

```javascript
var Keen = require("keen-js");
var apiKey = "YOUR_MASTER_KEY";
var scopedKey = "AN_EXISTING_SCOPED_KEY";

var options = Keen.utils.decryptScopedKey(apiKey, scopedKey);
// options will mirror configuration detailed above
```
