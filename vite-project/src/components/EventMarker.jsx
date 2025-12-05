import { useEffect } from "react";
import { searchInstagramAccount } from "../instagramAPI.js";

export default function EventMarker({ map, trackedAccounts }) {
  useEffect(() => {
    if (!map || !trackedAccounts || trackedAccounts.length === 0) return;

    const markers = [];

    const addMarkers = async () => {
      for (const username of trackedAccounts) {
        const accountData = await searchInstagramAccount(username);
        if (!accountData || !accountData.location) continue;

        const marker = new window.google.maps.Marker({
          position: accountData.location,
          map,
          title: accountData.name || username,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: black; padding: 8px;">
              <h3>${accountData.name || username}</h3>
              <p>@${accountData.username}</p>
            </div>
          `,
        });

        marker.addListener("click", () => infoWindow.open(map, marker));

        markers.push(marker);
      }
    };

    addMarkers();

    return () => markers.forEach((m) => m.setMap(null));
  }, [map, trackedAccounts]);

  return null;
}