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

  db.all(
    "SELECT rowid AS id, timestamp, type FROM events order by timestamp",
    function(_err, rows) {
      callback(rows);
      db.close();
    }
  );
};

const getFilteredEvents = dbPath => callback => {
  getEvents(dbPath)(rows => {
    callback(filterRows(rows));
  });
};

const filterRows = rows => {
  var start = null;
  var stop = null;

  return rows.reduce((prev, cur, index) => {
    if (cur.type === 0 && start !== null && stop !== null) {
      prev = [...prev, { ...start }, { ...stop }];
      start = cur;
      stop = null;
    } else if (cur.type === 0 && start === null) {
      start = cur;
      stop = null;
    } else if (cur.type === 1 && start !== null) {
      stop = cur;
    }

    if (index + 1 === rows.length && start !== null && stop !== null) {
      prev = [...prev, { ...start }, { ...stop }];
    } else if (index + 1 === rows.length && start !== null) {
      prev = [...prev, { ...start }];
    }

    return prev;
  }, []);
};

module.exports = {
  checkIn,
  checkOut,
  getFilteredEvents
};
