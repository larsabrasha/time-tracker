const express = require("express");
const fs = require("fs");
const app = express();

const store = require("./store");
const ical = require("./ical");

const apiKey = process.env.API_KEY;
const port = 3000;
const host = "0.0.0.0";

const dataDir = "data";
fs.access(dataDir, fs.constants.F_OK, err => {
  if (err) {
    fs.mkdir(dataDir, { recursive: true }, err => {
      if (err) console.log(`Error creating directory: ${err}`);
      else console.log("Data directory created successfully.");
    });
  }
});

app.use(function(req, res, next) {
  if (req.query.apiKey === apiKey) {
    next();
  } else {
    res.status(404).end();
  }
});

app.get("/events", (req, res) => {
  store.getEvents(events => {
    res.send(events);
  });
});

app.get("/events.ical", (req, res) => {
  store.getEvents(events => {
    const calendarEvents = ical.convertToICal(events);
    res.send(calendarEvents);
  });
});

app.post("/checkIn", (req, res) => {
  store.checkIn(new Date().getTime());
  res.send("Checked In");
});

app.post("/checkOut", (req, res) => {
  store.checkOut(new Date().getTime());
  res.send("Checked Out");
});

app.listen(port, host, () =>
  console.log(`Time Tracker running on port: ${port}!`)
);
