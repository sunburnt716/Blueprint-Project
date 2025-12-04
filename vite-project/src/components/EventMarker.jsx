import { useEffect } from "react";
import { searchInstagramAccount } from "../instagramAPI.js"; // the mock data API

export default function EventMarker({ map, trackedAccounts }) {
  useEffect(() => {
    if (!map || !trackedAccounts || trackedAccounts.length === 0) return;

    const markers = [];

    const addMarkers = async () => {
      for (const username of trackedAccounts) {
        // Fetch the account info from the mock API
        const accountData = await searchInstagramAccount(username);
        if (!accountData || !accountData.location) continue;

        const marker = new window.google.maps.Marker({
          position: accountData.location,
          map,
          title: accountData.name || username,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div>
                      <h3>${accountData.name || username}</h3>
                      <p>@${accountData.username}</p>
                    </div>`,
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
        markers.push(marker);
      }
    };

    addMarkers();

    // Cleanup markers on unmount or when trackedAccounts changes
    return () => markers.forEach((m) => m.setMap(null));
  }, [map, trackedAccounts]);

  return null;
}
