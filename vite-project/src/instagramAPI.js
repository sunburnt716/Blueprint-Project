import { updateInstagramCache } from "./firebase.js";

/**
 * Simulates fetching account data to check if it exists and is a business/creator account.
 * In a real application, this would call a server-side API or a Firebase Function
 * that securely queries the Instagram Graph API.
 * @param {string} username - The Instagram handle to search.
 * @returns {Promise<object | null>} Account data if found, or null.
 */
export const searchInstagramAccount = async (username) => {
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // 💡 Mock Data: Only 'club_a' and 'club_b' are found and are business accounts.
  const mockData = {
    test_account_a: {
      username: "test_account_a",
      isBusiness: true,
      location: { lat: 40.7128, lng: -74.006 }
    },
    rutgersblueprint: {
      username: "rutgersblueprint",
      isBusiness: true,
      location: { lat: 40.7580, lng: -73.9855 }
    },
  };

  const account = mockData[username];

  if (account && account.isBusiness) {
    return {
      username: username,
      ...account
    };
  }
  return null; // Not found or not a business/creator account
};