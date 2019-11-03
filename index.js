const express = require("express");
const app = express();

const store = require("./store");
const ical = require("./ical");
const { apiKey } = require("./api-key");

const port = 3000;

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

app.listen(port, "0.0.0.0", () =>
  console.log(`Example app listening on port ${port}!`)
);
