const express = require("express");
const fs = require("fs");
const app = express();

const { checkIn, checkOut, getFilteredEvents } = require("./store");
const ical = require("./ical");

const apiKey = process.env.API_KEY || "asdf";
const dbPath = process.env.DB_PATH || "/usr/src/app/data/db.sqlite";
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

const checkInToDb = checkIn(dbPath);
const checkOutToDb = checkOut(dbPath);
const getEventsFromDb = getFilteredEvents(dbPath);

const dataDir = "data";
fs.access(dataDir, fs.constants.F_OK, err => {
  if (err) {
    fs.mkdir(dataDir, { recursive: true }, err => {
      if (err) console.log(`Error creating directory: ${err}`);
      else console.log("Data directory created successfully.");
    });
  }
});

app.get("/", (req, res) => {
  res.send("OK\n");
});

app.use(function(req, res, next) {
  if (req.query.apiKey === apiKey) {
    next();
  } else {
    res.status(404).end();
  }
});

app.get("/events", (req, res) => {
  getEventsFromDb(events => {
    res.send(events.map(x => ({ ...x, timestamp: new Date(x.timestamp) })));
  });
});

app.get("/events.ical", (req, res) => {
  getEventsFromDb(events => {
    res.send(ical.getEvents(events));
  });
});

app.get("/summaries.ical", (req, res) => {
  getEventsFromDb(events => {
    res.send(ical.getSummaries(events));
  });
});

app.post("/checkIn", (req, res) => {
  checkInToDb(new Date().getTime());
  res.send("Checked In");
});

app.post("/checkOut", (req, res) => {
  checkOutToDb(new Date().getTime());
  res.send("Checked Out");
});

app.listen(port, host, () =>
  console.log(`Time Tracker running on port: ${port}!`)
);
