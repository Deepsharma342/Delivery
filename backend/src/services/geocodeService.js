import axios from "axios";

export const getCoordinatesFromPostcode = async (postcode) => {
  try {
    const cleanedPostcode = postcode.replace(/\s+/g, "");

    const response = await axios.get(
      `https://api.postcodes.io/postcodes/${cleanedPostcode}`
    );

    const result = response.data.result;

    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch (error) {
    console.error("Geocoding Error:", error.message);

    return {
      latitude: null,
      longitude: null,
    };
  }
};