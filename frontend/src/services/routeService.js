import axios from "axios";

const API_URL = "https://nityant-tech-cn5n.onrender.com/api/route";

export const optimizeRoute = async (depotPostcode) => {
  const response = await axios.post(
    `${API_URL}/optimize`,
    {
      depotPostcode,
    }
  );

  return response.data;
};