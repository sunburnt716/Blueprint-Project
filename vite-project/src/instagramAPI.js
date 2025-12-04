import { updateInstagramCache } from "./firebase.js";

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
    test_a: {
      username: "test_a",
      name: "Test Account A",
      isBusiness: true,
      location: { lat: 40.502816475580396, lng: -74.45207104430426 },
    },
    test_b: {
      username: "test_b",
      name: "Test Account B",
      isBusiness: true,
      location: { lat: 40.52340518764876, lng: -74.45830437357046 },
    },
    test_c: {
      username: "test_c",
      name: "Test Account C",
      isBusiness: true,
      location: { lat: 40.52361408326971, lng: -74.43720414347104 },
    },
    rutgersblueprint: {
      username: "rutgersblueprint",
      name: "Rutgers Blueprint",
      isBusiness: true,
      location: { lat: 40.50502571797236, lng: -74.4524553673336 },
    },
  };

  const account = mockData[username.toLowerCase()];

  if (account && account.isBusiness) {
    return { ...account };
  }

  // Not found or not a business/creator account
  return null;
}
