const ical = require("ical-generator");

function roundToNearest15Minutes(timestamp) {
  var newTimestamp = new Date(timestamp.getTime());

  var seconds = timestamp.getMinutes() * 60 + timestamp.getSeconds();

  if (seconds >= 0 && seconds < 7 * 60 + 30) {
    newTimestamp.setMinutes(0);
    newTimestamp.setSeconds(0);
    newTimestamp.setMilliseconds(0);
  } else if (seconds >= 7 * 60 + 30 && seconds < 22 * 60 + 30) {
    newTimestamp.setMinutes(15);
    newTimestamp.setSeconds(0);
    newTimestamp.setMilliseconds(0);
  } else if (seconds >= 22 * 60 + 30 && seconds < 37 * 60 + 30) {
    newTimestamp.setMinutes(30);
    newTimestamp.setSeconds(0);
    newTimestamp.setMilliseconds(0);
  } else if (seconds >= 37 * 60 + 30 && seconds < 52 * 60 + 30) {
    newTimestamp.setMinutes(45);
    newTimestamp.setSeconds(0);
    newTimestamp.setMilliseconds(0);
  } else if (seconds >= 52 * 60 + 30 && seconds < 60 * 60) {
    newTimestamp.setMinutes(60);
    newTimestamp.setSeconds(0);
    newTimestamp.setMilliseconds(0);
  }

  return newTimestamp;
}

function roundedToFixed(_float, _digits) {
  var rounder = Math.pow(10, _digits);

  return (Math.round(_float * rounder) / rounder).toFixed(_digits);
}

module.exports = {
  testRound: function(timestamp) {
    return roundToNearest15Minutes(timestamp);
  },
  convertToICal: function(events) {
    var calendarEvents = events.reduce((prev, cur) => {
      var timestamp = roundToNearest15Minutes(
        new Date(cur.timestamp)
      ).getTime();

      if (cur.type === 0) {
        return [...prev, { id: cur.id, startTime: timestamp, stopTime: null }];
      } else if (cur.type === 1) {
        prev[prev.length - 1] = {
          id: cur.id,
          startTime: prev[prev.length - 1].startTime,
          stopTime: timestamp
        };
        return prev;
      }
      return prev;
    }, []);

    return ical({
      domain: "larsabrasha.com",
      prodId: { company: "Larsabrasha", product: "time-tracker" },
      events: calendarEvents.map(x => {
        const start = new Date(x.startTime);
        const end =
          x.stopTime != null
            ? new Date(x.stopTime)
            : roundToNearest15Minutes(new Date());

        const durationInHours =
          (end.getTime() - start.getTime()) / 1000 / 60 / 60;
        durationInHoursRounded = roundedToFixed(durationInHours, 2);

        return {
          uid: x.id,
          start: start,
          end: end,
          summary: durationInHoursRounded + " h"
        };
      })
    }).toString();
  }
};
