// EventMarker.jsx
import { useEffect } from "react";
import { searchInstagramAccount } from "../api/instagramAPI.js"; // the mock data API

export default function EventMarker({ map, trackedClubs }) {
  useEffect(() => {
    if (!map || !trackedClubs || trackedClubs.length === 0) return;

    const markers = [];

    const addMarkers = async () => {
      for (const username of trackedClubs) {
        // Fetch the club info from the mock API
        const clubData = await searchInstagramAccount(username);
        if (!clubData || !clubData.location) continue;

        const marker = new window.google.maps.Marker({
          position: clubData.location,
          map,
          title: clubData.name || username,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div>
                      <h3>${clubData.name || username}</h3>
                      <p>@${clubData.username}</p>
                    </div>`,
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
        markers.push(marker);
      }
    };

    addMarkers();

    // Cleanup markers on unmount or when trackedClubs changes
    return () => markers.forEach((m) => m.setMap(null));
  }, [map, trackedClubs]);

  return null;
}
