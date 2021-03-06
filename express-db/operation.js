const assert = require('assert');

exports.insertDocument = (db, document, collection, callback) => {
  const col = db.collection(collection);
  collection.insert(document, (err, result) => {
    assert.equal(err, null);
    console.log(`Inserted ${result.result.n} documents into ${collection}`);
    callback(result);
  });
};

exports.findDocuments = (db, collection, callback) => {
  const col = db.collection(collection);
  collection.find({}).toArray((err, docs) => {
    assert.equal(err, null);
    callback(docs);
  });
};

exports.removeDocument = (db, document, collection, callback) => {
  const col = db.collection(collection);
  collection.deleteOne(document, (err, result) => {
    assert.equal(err, null);
    console.log(`Removed ${document} from ${collection}`);
    callback(result);
  });
};

exports.updateDocument = (db, document, update, collection, callback) => {
  const col = db.collection(collection);
  collection.updateOne(
    document,
    {
      $set: update,
    },
    null,
    (err, result) => {
      assert.equal(err, null);
      console.log(`Updated ${document}`);
      callback(result);
    }
  );
};
