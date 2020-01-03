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

function getCalendarEvents(events) {
  return events.reduce((prev, cur) => {
    var timestamp = roundToNearest15Minutes(new Date(cur.timestamp)).getTime();

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
}

function getIcalEvents(calendarEvents) {
  return calendarEvents.map(x => {
    const start = new Date(x.startTime);
    const end =
      x.stopTime != null
        ? new Date(x.stopTime)
        : roundToNearest15Minutes(new Date());

    const durationInHours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    durationInHoursRounded = roundedToFixed(durationInHours, 2);

    return {
      uid: x.id,
      start,
      end,
      duration: parseFloat(durationInHoursRounded),
      summary: durationInHoursRounded + " h"
    };
  });
}

module.exports = {
  getEvents: function(events) {
    var calendarEvents = getCalendarEvents(events);
    var icalEvents = getIcalEvents(calendarEvents);

    return ical({
      domain: "larsabrasha.com",
      prodId: { company: "Larsabrasha", product: "time-tracker" },
      events: icalEvents
    }).toString();
  },
  getSummaries: function(events) {
    var calendarEvents = getCalendarEvents(events);
    var icalEvents = getIcalEvents(calendarEvents);

    var summaryByDay = icalEvents.reduce((prev, cur) => {
      const startAtMidnight = new Date(cur.start.getTime());
      startAtMidnight.setUTCHours(0);
      startAtMidnight.setUTCMinutes(0);
      startAtMidnight.setUTCSeconds(0);
      startAtMidnight.setUTCMilliseconds(0);

      const key = "" + startAtMidnight.getTime();
      const previous = prev[key];

      prev[key] = {
        uid: key,
        start: startAtMidnight,
        duration:
          previous != null ? previous.duration + cur.duration : cur.duration
      };

      return prev;
    }, {});

    summaries = Object.values(summaryByDay).sort((a, b) =>
      a.start > b.start ? 1 : b.start > a.start ? -1 : 0
    );

    const summariesWithCalc = summaries.map(x => {
      const scheduledTime = x.start.getDay() == 5 ? 7 : 7.75;

      const summary =
        x.duration > scheduledTime
          ? `${x.duration} h (${scheduledTime} + ${x.duration - scheduledTime})`
          : x.duration < scheduledTime
          ? `${x.duration} h (${scheduledTime} - ${scheduledTime - x.duration})`
          : `${x.duration} h`;

      return { ...x, summary };
    });

    return ical({
      domain: "larsabrasha.com",
      prodId: { company: "Larsabrasha", product: "time-tracker" },
      events: summariesWithCalc.map(x => {
        return {
          uid: x.uid,
          start: x.start,
          allDay: true,
          summary: x.summary
        };
      })
    }).toString();
  }
};
