import axios from "axios";

const API_URL = "http://localhost:5000/api/routes";

export const optimizeRoute = async (depotPostcode) => {
  const response = await axios.post(
    `${API_URL}/optimize`,
    {
      depotPostcode,
    }
  );

  return response.data;
};