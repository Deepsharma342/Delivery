import axios from "axios";

// Basic UK postcode format check (covers all valid formats)
const isValidUKPostcode = (postcode) =>
  /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(postcode.trim());

export const getCoordinatesFromPostcode = async (postcode) => {
  const cleanedPostcode = postcode.replace(/\s+/g, "").toUpperCase();

  // Validate format before hitting the API
  if (!isValidUKPostcode(cleanedPostcode)) {
    console.warn(`Invalid postcode format: "${postcode}"`);
    return { latitude: null, longitude: null, error: "invalid_format" };
  }

  try {
    const response = await axios.get(
      `https://api.postcodes.io/postcodes/${cleanedPostcode}`
    );

    const result = response.data.result;

    // Paranoia check — API returned 200 but result is empty
    if (!result || result.latitude == null || result.longitude == null) {
      console.warn(`No coordinates returned for: "${postcode}"`);
      return { latitude: null, longitude: null, error: "no_coords" };
    }

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      error: null,
    };
  } catch (error) {
    const status = error.response?.status;

    if (status === 404) {
      console.warn(`Postcode not found: "${postcode}"`);
      return { latitude: null, longitude: null, error: "not_found" };
    }

    console.error(`Geocoding failed for "${postcode}":`, error.message);
    return { latitude: null, longitude: null, error: "network_error" };
  }
};