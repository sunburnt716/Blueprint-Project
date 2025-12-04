import React, { useState } from "react";
import { parseICS } from "../utils/parseICS";
import {
  collection,
  addDoc,
  getFirestore,
  Timestamp,
} from "firebase/firestore";
import { getGeocode, getLatLng } from "use-places-autocomplete";

const UploadPage = ({ user }) => {
  const [icsUrl, setIcsUrl] = useState("");
  const [status, setStatus] = useState("");

  const db = getFirestore();

  const handleImportCalendar = async () => {
    try {
      setStatus("Fetching calendar...");

      const response = await fetch(icsUrl);
      if (!response.ok) throw new Error("Failed to fetch ICS file.");
      const icsText = await response.text();

      const events = parseICS(icsText);

      for (let event of events) {
        let locationData = null;

        if (event.location) {
          try {
            const geocodeResults = await getGeocode({
              address: event.location,
            });
            const { lat, lng } = await getLatLng(geocodeResults[0]);
            locationData = { lat, lng };
          } catch (err) {
            console.warn("Geocoding failed for:", event.location);
          }
        }

        await addDoc(collection(db, "events"), {
          userId: user.uid,
          title: event.title,
          startTime: Timestamp.fromDate(event.startTime),
          endTime: Timestamp.fromDate(event.endTime),
          location: event.location || null,
          coordinates: locationData,
        });
      }

      setStatus(`Imported ${events.length} events successfully!`);
    } catch (err) {
      console.error(err);
      setStatus("Error importing calendar. Check console for details.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Your Events</h2>

      <p className="mb-4 text-gray-600">
        Paste a public Google Calendar ICS URL to import and map your events.
      </p>

      <div className="mb-4">
        <label className="block mb-2">Google Calendar ICS URL:</label>
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="https://calendar.google.com/calendar/ical/..."
          value={icsUrl}
          onChange={(e) => setIcsUrl(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleImportCalendar}
      >
        Import Calendar
      </button>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
};

export default UploadPage;
