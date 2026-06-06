import { useEffect, useState } from "react";
import {
  createStop,
  deleteStop,
  getStops,
} from "../services/stopService";

const AddStops = () => {
  const [postcode, setPostcode] = useState("");
  const [stops, setStops] = useState([]);

  const fetchStops = async () => {
    try {
      const data = await getStops();
      setStops(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postcode.trim()) return;

    await createStop(postcode);

    setPostcode("");

    fetchStops();
  };

  const handleDelete = async (id) => {
    await deleteStop(id);
    fetchStops();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Delivery Route Optimizer</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />

        <button type="submit">
          Add Stop
        </button>
      </form>

      <hr />

      <h2>Stops</h2>

      {stops.map((stop) => (
        <div
          key={stop._id}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <span>{stop.postcode}</span>

          <button
            onClick={() =>
              handleDelete(stop._id)
            }
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AddStops;