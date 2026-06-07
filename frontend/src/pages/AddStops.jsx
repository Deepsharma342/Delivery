import { useEffect, useState } from "react";
import {
  createStop,
  deleteStop,
  getStops,
  bulkCreateStops,
} from "../services/stopService";


const AddStops = () => {
  const [postcode, setPostcode] = useState("");
  const [bulkText, setBulkText] = useState("");
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

  const handleBulkImport = async () => {
  const postcodes = bulkText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!postcodes.length) return;

  await bulkCreateStops(postcodes);

  setBulkText("");

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

      <hr />

<h2>Bulk Import</h2>

<textarea
  rows="10"
  cols="40"
  placeholder="Paste one postcode per line"
  value={bulkText}
  onChange={(e) => setBulkText(e.target.value)}
/>

<br />

<button onClick={handleBulkImport}>
  Import Stops
</button>

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