import { useState, useEffect } from "react";
import { optimizeRoute } from "../services/routeService";
import DriverRoute from "./driverRoute";

const OptimizedRoute = () => {
  const [depotPostcode, setDepotPostcode] = useState("");
  const [route, setRoute] = useState([]);
  const [showDriverView, setShowDriverView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedRoute = JSON.parse(localStorage.getItem("route") || "[]");
      const savedDepot = localStorage.getItem("depotPostcode") || "";

      if (savedRoute.length > 0) {
        const hasPendingStops = savedRoute.some((stop) => !stop.completed);
        if (hasPendingStops) {
          setRoute(savedRoute);
          setShowDriverView(true);
        } else {
          localStorage.removeItem("route");
          localStorage.removeItem("depotPostcode");
        }
      }

      if (savedDepot) setDepotPostcode(savedDepot);
    } catch (err) {
      // localStorage was corrupted — wipe it and start fresh
      localStorage.removeItem("route");
      localStorage.removeItem("depotPostcode");
    }
  }, []);

  const handleOptimize = async () => {
    if (!depotPostcode.trim()) return;
    setLoading(true);
    setError("");

    try {
      const optimizedRoute = await optimizeRoute(depotPostcode);

      if (!optimizedRoute || optimizedRoute.length === 0) {
        setError("No stops found to optimize.");
        return;
      }

      setRoute(optimizedRoute);
      localStorage.setItem("route", JSON.stringify(optimizedRoute));
      localStorage.setItem("depotPostcode", depotPostcode);
      setShowDriverView(true);
    } catch (err) {
      setError("Failed to optimize route. Check your depot postcode.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshRoute = () => {
    try {
      const savedRoute = JSON.parse(localStorage.getItem("route") || "[]");
      const hasPendingStops = savedRoute.some((stop) => !stop.completed);

      if (!hasPendingStops) {
        localStorage.removeItem("route");
        localStorage.removeItem("depotPostcode");
        setRoute([]);
        setShowDriverView(false);
        return;
      }

      setRoute(savedRoute);
    } catch (err) {
      localStorage.removeItem("route");
      localStorage.removeItem("depotPostcode");
      setRoute([]);
      setShowDriverView(false);
    }
  };

  if (showDriverView) {
    return <DriverRoute route={route} onRefresh={refreshRoute} />;
  }

  const totalDistance = route.reduce(
    (sum, stop) => sum + (stop.distanceFromPrevious || 0), 0
  );
  const longestJump = route.length > 0
    ? Math.max(...route.map((s) => s.distanceFromPrevious || 0)) : 0;
  const shortestJump = route.length > 0
    ? Math.min(...route.map((s) => s.distanceFromPrevious || 0)) : 0;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Optimize Route</h1>

      <input
        type="text"
        placeholder="Depot Postcode"
        value={depotPostcode}
        onChange={(e) => setDepotPostcode(e.target.value)}
        style={{ padding: "10px", marginRight: "10px" }}
      />

      <button onClick={handleOptimize} disabled={loading}>
        {loading ? "Optimizing..." : "Optimize"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      <hr />

      {route.length > 0 && (
        <>
          <h2>📍 Route Preview</h2>
          <div style={{
            border: "1px solid #ccc", padding: "15px",
            borderRadius: "10px", marginBottom: "20px", background: "#f8f9fa",
          }}>
            <p>🚚 Total Stops: {route.length}</p>
            <p>📏 Total Distance: {totalDistance.toFixed(2)} km</p>
            <p>🔥 Longest Jump: {longestJump.toFixed(2)} km</p>
            <p>⚡ Shortest Jump: {shortestJump.toFixed(2)} km</p>
          </div>

          {route.map((stop, index) => (
            <div key={stop._id} style={{
              marginBottom: "12px", padding: "15px",
              border: "1px solid #ccc", borderRadius: "10px",
              background: stop.distanceFromPrevious > 5 ? "#fff3cd" : "#f8f9fa",
            }}>
              <strong>Stop {index + 1}</strong>
              <p>📮 {stop.postcode}</p>
              <p>📏 Distance From Previous: {stop.distanceFromPrevious?.toFixed(2)} km</p>
              {stop.distanceFromPrevious > 5 && (
                <p style={{ color: "#ff8800", fontWeight: "bold" }}>⚠ Long Distance Jump</p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default OptimizedRoute;