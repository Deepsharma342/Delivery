import { useEffect, useState } from "react";
import {
  createStop,
  deleteStop,
  deleteAllStops,
  getStops,
  bulkCreateStops,
} from "../services/stopService";

const AddStops = () => {
  const [postcode, setPostcode] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [stops, setStops] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const handleDeleteAll = async () => {
    // First click shows confirm, second click deletes
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await deleteAllStops();
      localStorage.removeItem("route");
      localStorage.removeItem("depotPostcode");
      setStops([]);
      setConfirmDelete(false);
    } catch (error) {
      console.error(error);
    }
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
        <button type="submit">Add Stop</button>
      </form>

      <hr />

      <h2>Bulk Import</h2>

      <textarea
        rows="10"
        cols="40"
        placeholder="Paste one postcode per line for bulk import"
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
      />

      <br />

      <button onClick={handleBulkImport}>Import Stops</button>

      <hr />

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>Stops ({stops.length})</h2>

        {stops.length > 0 && (
          <button
            onClick={handleDeleteAll}
            style={{
              padding: "8px 16px",
              background: confirmDelete ? "#dc2626" : "#991b1b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {confirmDelete ? "⚠️ Confirm Delete All" : "🗑️ Delete All Stops"}
          </button>
        )}

        {confirmDelete && (
          <button
            onClick={() => setConfirmDelete(false)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {stops.map((stop) => (
        <div
          key={stop._id}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            alignItems: "center",
          }}
        >
          <span>{stop.postcode}</span>

          <button onClick={() => handleDelete(stop._id)}>
            Delete route
          </button>
        </div>
      ))}
    </div>
  );
};

export default AddStops;