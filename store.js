const sqlite3 = require("sqlite3");

const createDb = dbPath => new sqlite3.Database(dbPath);

const save = dbPath => {
  var db = createDb(dbPath);

  return (timestamp, type) => {
    db.serialize(() => {
      // db.run("DROP TABLE IF EXISTS events");
      db.run(
        "CREATE TABLE IF NOT EXISTS events (timestamp INTEGER, type INTEGER)"
      );

      var stmt = db.prepare("INSERT INTO events VALUES (?, ?)");
      stmt.run(timestamp, type);
      stmt.finalize();

      db.close();
    });
  };
};

const checkIn = dbPath => timestamp => {
  save(dbPath)(timestamp, 0);
};

const checkOut = dbPath => timestamp => {
  save(dbPath)(timestamp, 1);
};

const getEvents = dbPath => callback => {
  const db = createDb(dbPath);

  db.all("SELECT rowid AS id, timestamp, type FROM events", function(
    err,
    rows
  ) {
    callback(rows);
    db.close();
  });
};

module.exports = {
  checkIn,
  checkOut,
  getEvents
};
