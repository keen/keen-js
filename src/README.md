


### Tracker

*Usage: Use with responsibility*

##### .addEvent([string eventCollection, object payload, function (optional) success, function (optional) error])
*Add a single event with a single payload*
```js
client.addEvent('purchase', { name: 'Chair', price: 12.99 });
// or
client.addEvent(
  'login', 
  { name: 'Dustin', profession: 'breakdancing' }, 
  function() { console.log('Breaking good'); },
  function() { console.log('Breaking bad'); })
})
```

##### .addEvents([array payload])
*Either add multiple events with multiple payloads or add multiple payloads with just a single event*
```js
// Multiple payloads with multiple events
var payloads = [{ 
                  collectionOne: [{ a : 1 }]
                }, {
                  collectionTwo: [{ a : 2 }] 
                }];
client.addEvents("boohoo", payloads, function() {
  console.log('woohoo!');
}, function() {
  console.log('noo');
});
```
##### .addEvents([string eventCollection, array payload])
```js
// Multiple payloads with single event
client.addEvents("collectionName", [{ a : 1 }, { a : 2 }])
```

##### .queueEvent([string eventCollection, object payload, number (optional) timeout, function (optional) success, function (optional) error])
*Same as addEvent but with a timeout option*

```js
client.queueEvent("test", { one: 'two' }, 10000, function() {
                    console.log('test');
                  }, function() {
                    console.log('failure');
                  });

```

##### .queueEvents([array payloads, number timeout, function (optional) success, function (optional) error])
*Add multiple events with multiple payloads with a timeout option. Defaults to 3000 milliseconds.*

```js
var payloads = [{ 
                  collectionOne: [{ a : 1 }]
                }, {
                  collectionTwo: [{ a : 2 }] 
               }];
client.queueEvents(payloads, 5000, function() {
  console.log('Success!');
}, function() {
  console.log('Fail!');
});

```


##### .trackExternalLink([object jsEvent, string eventCollection, object payload, number (optional) timeout, function (optional) timeoutCallback])

```js

```
