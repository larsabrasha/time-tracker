const sqlite3 = require("sqlite3");

module.exports = class Store {
  dbPath;

  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  getDb() {
    return new sqlite3.Database(this.dbPath);
  }

  checkIn(timestamp) {
    save(timestamp, 0);
  }

  checkOut(timestamp) {
    save(timestamp, 1);
  }

  getEvents(callback) {
    const db = this.getDb();

    db.all("SELECT rowid AS id, timestamp, type FROM events", function(
      err,
      rows
    ) {
      callback(rows);
      db.close();
    });
  }

  save(timestamp, type) {
    const db = this.getDb();

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
  }
};
