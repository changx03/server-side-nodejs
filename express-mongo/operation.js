const assert = require('assert');

exports.insertDocument = (db, document, collection) => {
  const col = db.collection(collection);
  // col.insert(document, (err, result) => {
  //   assert.equal(err, null);
  //   console.log(`Inserted ${result.result.n} documents into ${collection}`);
  //   callback(result);
  // });
  return col.insert(document);
};

exports.findDocuments = (db, collection) => {
  const col = db.collection(collection);
  // col.find({}).toArray((err, docs) => {
  //   assert.equal(err, null);
  //   callback(docs);
  // });
  return col.find({}).toArray();
};

exports.removeDocument = (db, document, collection) => {
  const col = db.collection(collection);
  // col.deleteOne(document, (err, result) => {
  //   assert.equal(err, null);
  //   console.log(`Removed ${document} from ${collection}`);
  //   callback(result);
  // });
  return col.deleteOne(document);
};

exports.updateDocument = (db, document, update, collection) => {
  const col = db.collection(collection);
  // col.updateOne(
  //   document,
  //   {
  //     $set: update,
  //   },
  //   null,
  //   (err, result) => {
  //     assert.equal(err, null);
  //     console.log(`Updated ${document}`);
  //     callback(result);
  //   }
  // );
  return col.updateOne(document, { $set: update });
};
