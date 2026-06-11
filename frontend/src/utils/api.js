/**
 * Backend base URL — single source of truth for all API calls.
 *
 * In local dev:  VITE_API_URL is empty → requests go through the Vite proxy
 *                to http://localhost:4000
 * In production: VITE_API_URL = "https://fooddelivery1-6xvv.onrender.com"
 *                (set in Vercel environment variables)
 */
export const API_URL = import.meta.env.VITE_API_URL ?? "";
