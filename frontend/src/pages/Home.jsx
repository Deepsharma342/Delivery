import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStops } from "../services/stopService";

const Home = () => {
  const [stops, setStops] = useState([]);

  const loadStops = async () => {
    try {
      const response = await getStops();

      console.log("HOME STOPS:", response);

      // Handles both:
      // [ ... ]
      // { success:true, data:[ ... ] }

      const stopsArray = Array.isArray(response)
        ? response
        : response.data || [];

      setStops(stopsArray);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadStops();

    const interval = setInterval(
      loadStops,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  const totalStops = stops.length;

  const completedStops = stops.filter(
    (stop) => stop.completed
  ).length;

  const remainingStops =
    totalStops - completedStops;

  const progress =
    totalStops > 0
      ? Math.round(
          (completedStops / totalStops) * 100
        )
      : 0;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1>🏠 Home</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <h2>Today's Route</h2>

        <p>Total Stops: {totalStops}</p>

        <p>Completed: {completedStops}</p>

        <p>Remaining: {remainingStops}</p>

        <p>Progress: {progress}%</p>

        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#22c55e",
              transition: "0.3s",
            }}
          />
        </div>

        <Link to="/route">
          <button
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "15px",
              fontSize: "18px",
            }}
          >
            Continue Route
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;