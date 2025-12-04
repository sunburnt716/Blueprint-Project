import ical from "ical.js";

// input: ICS text as string
export function parseICS(icsText) {
  const jcalData = ical.parse(icsText);
  const comp = new ical.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");

  const events = vevents.map((event) => {
    const e = new ical.Event(event);
    return {
      title: e.summary,
      startTime: e.startDate.toJSDate(),
      endTime: e.endDate.toJSDate(),
      location: e.location || null,
    };
  });

  return events;
}
