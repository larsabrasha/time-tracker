const sqlite3 = require("sqlite3");

save = function(timestamp, type) {
  var db = new sqlite3.Database("/usr/src/app/data/db.sqlite");

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

module.exports = {
  checkIn: function(timestamp) {
    save(timestamp, 0);
  },

  checkOut: function(timestamp) {
    save(timestamp, 1);
  },

  getEvents: function(callback) {
    var db = new sqlite3.Database("/usr/src/app/data/db.sqlite");

    db.all("SELECT rowid AS id, timestamp, type FROM events", function(
      err,
      rows
    ) {
      callback(rows);
      db.close();
    });
  }
};
