const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchData(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}
