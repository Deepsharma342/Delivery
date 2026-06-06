import axios from "axios";

const API_URL = "http://localhost:5000/api/stops";

export const getStops = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createStop = async (postcode) => {
  const response = await axios.post(API_URL, {
    postcode,
  });

  return response.data;
};

export const deleteStop = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};