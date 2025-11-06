import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68b6a4b12bf1513a8f0e0f14", 
  requiresAuth: true // Ensure authentication is required for all operations
});
