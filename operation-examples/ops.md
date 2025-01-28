### insert

---

cmd:

```js
db.testCollection.insertOne({
  name: "Alice",
  age: 30,
  city: "New York",
});
```

req:

```js
{
  insert: 'testCollection',
  documents: [
    {
      name: 'Alice',
      age: 30,
      city: 'New York',
      _id: new ObjectId('6780556d0a4de6aa16bd3817')
    }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 1, ok: 1 }
```

### insertMany

---

cmd:

```js
db.testCollection.insertMany([
  { name: "Bob", age: 25, city: "Los Angeles" },
  { name: "Charlie", age: 35, city: "Chicago" },
  { name: "Diana", age: 28, city: "Miami" },
]);
```

req:

```js
{
  insert: 'testCollection',
  documents: [
    {
      name: 'Bob',
      age: 25,
      city: 'Los Angeles',
      _id: new ObjectId('678055e10a4de6aa16bd3818')
    },
    {
      name: 'Charlie',
      age: 35,
      city: 'Chicago',
      _id: new ObjectId('678055e10a4de6aa16bd3819')
    },
    {
      name: 'Diana',
      age: 28,
      city: 'Miami',
      _id: new ObjectId('678055e10a4de6aa16bd381a')
    }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 3, ok: 1 }
```

### updateOne

---

cmd:

```js
db.testCollection.updateOne(
  { name: "Alice" }, // Query
  { $set: { city: "San Francisco" } } // Update
);
```

req:

```js
 {
  update: 'testCollection',
  updates: [
    { q: { name: 'Alice' }, u: { '$set': { city: 'San Francisco' } } }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 1, nModified: 1, ok: 1 }
```

### updateMany

---

cmd:

```js
db.testCollection.updateMany(
  { age: { $gte: 30 } }, // Query
  { $inc: { age: 1 } } // Increment age by 1
);
```

req:

```js
{
  update: 'testCollection',
  updates: [
    {
      q: { age: { '$gte': 30 } },
      u: { '$inc': { age: 1 } },
      multi: true
    }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 2, nModified: 2, ok: 1 }
```

### replaceOne

---

cmd:

```js
db.testCollection.replaceOne(
  { name: "Bob" }, // Query
  { name: "Bob", age: 26, city: "Seattle" } // New Document
);
```

req:

```js
{
  update: 'testCollection',
  updates: [
    {
      q: { name: 'Bob' },
      u: { name: 'Bob', age: 26, city: 'Seattle' }
    }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 1, nModified: 1, ok: 1 }
```

### findOneAndUpdate [returnDocument - after]

---

cmd:

```js
db.testCollection.findOneAndUpdate(
  { name: "Charlie" }, // Query
  { $set: { city: "Houston" } }, // Update
  { returnDocument: "after" } // Return the updated document
);
```

req:

```js
{
  findAndModify: 'testCollection',
  query: { name: 'Charlie' },
  remove: false,
  new: true,
  upsert: false,
  update: { '$set': { city: 'Houston' } },
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{
  lastErrorObject: { n: 1, updatedExisting: true },
  value: {
    _id: new ObjectId('678055e10a4de6aa16bd3819'),
    name: 'Charlie',
    age: 36,
    city: 'Houston'
  },
  ok: 1
}
```

### findOneAndUpdate [returnDocument - before]

---

cmd:

```js
db.testCollection.findOneAndUpdate(
  { name: "Charlie" }, // Query
  { $set: { city: "Houston" } }, // Update
  { returnDocument: "before" } // Return the updated document
);
```

req:

```js
{
  findAndModify: 'testCollection',
  query: { name: 'Charlie' },
  remove: false,
  new: false,
  upsert: false,
  update: { '$set': { city: 'LA' } },
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{
  lastErrorObject: { n: 1, updatedExisting: true },
  value: {
    _id: new ObjectId('678055e10a4de6aa16bd3819'),
    name: 'Charlie',
    age: 36,
    city: 'Houston'
  },
  ok: 1
}
```

### deleteOne

---

cmd:

```js
db.testCollection.deleteOne({ name: "Diana" });
```

req:

```js
{
  delete: 'testCollection',
  deletes: [ { q: { name: 'Diana' }, limit: 1 } ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 1, ok: 1 }
```

### deleteMany

---

```js
db.testCollection.deleteMany({ age: { $lt: 30 } });
```

req:

```js
{
  delete: 'testCollection',
  deletes: [
    { q: { age: { '$lt': 30 } }, limit: 0 }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 1, ok: 1 }
```

### insertOne (Custom ID)

---

cmd:

```js
db.testCollection.insertOne({
  _id: "custom_id_123",
  name: "Eve",
  age: 40,
  city: "Boston",
});
```

req:

```js
{
  insert: 'testCollection',
  documents: [ { _id: 'custom_id_123', name: 'Eve', age: 40, city: 'Boston' } ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 1, ok: 1 }
```

### updateOne (Upsert)

---

cmd:

```js
db.testCollection.updateOne(
  { name: "Frank" }, // Query
  { $set: { age: 50, city: "Denver" } }, // Update
  { upsert: true } // Insert if not found
);
```

req:

```js
{
  update: 'testCollection',
  updates: [
    {
      q: { name: 'Frank' },
      u: { '$set': { age: 50, city: 'Denver' } },
      upsert: true
    }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{
  n: 1,
  upserted: [ { index: 0, _id: new ObjectId('678058ddb3a8ce199a04e10a') } ],
  nModified: 0,
  ok: 1
}
```

### deleteMany (Condition)

---

cmd:

```js
db.testCollection.deleteMany({ city: { $in: ["Los Angeles", "Houston"] } });
```

req:

```js
{
  delete: 'testCollection',
  deletes: [
    {
      q: { city: { '$in': [ 'Los Angeles', 'Houston' ] } },
      limit: 0
    }
  ],
  ordered: true,
  lsid: { id: new UUID('6a89b950-29eb-43ab-9a3b-14a606952f54') },
  '$db': 'myDatabase'
}
```

res:

```js
{ n: 0, ok: 1 }
```
