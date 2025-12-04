<<<<<<< HEAD:vite-project/src/instagramAPI.js
import { updateInstagramCache } from "./firebase.js";
=======
// src/api/instagramAPI.js
>>>>>>> a5af12717d3bdf817aef241fab8124bc3749fc92:vite-project/src/api/instagramAPI.js

/**
 * Simulates fetching account data to check if it exists and is a business/creator account.
 * In a real application, this would call a server-side API or a Firebase Function
 * that securely queries the Instagram Graph API.
 *
 * @param {string} username - The Instagram handle to search.
 * @returns {Promise<object | null>} Account data if found, or null.
 */
export async function searchInstagramAccount(username) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 💡 Mock Data: Only these accounts exist
  const mockData = {
    test_account_a: {
      username: "test_account_a",
      name: "Test Club A",
      isBusiness: true,
      location: { lat: 40.7128, lng: -74.006 },
    },
    rutgersblueprint: {
      username: "rutgersblueprint",
      name: "Rutgers Blueprint",
      isBusiness: true,
      location: { lat: 40.758, lng: -73.9855 },
    },
  };

  const account = mockData[username.toLowerCase()];

  if (account && account.isBusiness) {
    return { ...account };
  }

  // Not found or not a business/creator account
  return null;
}
