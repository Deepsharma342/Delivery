import { useState, useEffect } from "react";
import { optimizeRoute } from "../services/routeService";
import DriverRoute from "./driverRoute";

const OptimizedRoute = () => {
  const [depotPostcode, setDepotPostcode] = useState("");
  const [route, setRoute] = useState([]);
  const [showDriverView, setShowDriverView] = useState(false);

  useEffect(() => {
    const savedRoute = localStorage.getItem("route");
    const savedDepot = localStorage.getItem("depotPostcode");

    if (savedRoute) {
      const parsedRoute = JSON.parse(savedRoute);

      const hasPendingStops = parsedRoute.some(
        (stop) => !stop.completed
      );

      if (hasPendingStops) {
        setRoute(parsedRoute);
        setShowDriverView(true);
      } else {
        localStorage.removeItem("route");
        localStorage.removeItem("depotPostcode");
      }
    }

    if (savedDepot) {
      setDepotPostcode(savedDepot);
    }
  }, []);

  const handleOptimize = async () => {
    if (!depotPostcode.trim()) return;

    try {
      const response = await optimizeRoute(
        depotPostcode
      );

      const optimizedRoute = response.data;

      setRoute(optimizedRoute);

      localStorage.setItem(
        "route",
        JSON.stringify(optimizedRoute)
      );

      localStorage.setItem(
        "depotPostcode",
        depotPostcode
      );

      setShowDriverView(true);
    } catch (error) {
      console.error(error);
    }
  };


const refreshRoute = () => {
  // ✅ Read from localStorage — preserves optimized order
  const savedRoute = JSON.parse(localStorage.getItem("route") || "[]");

  const hasPendingStops = savedRoute.some((stop) => !stop.completed);

  if (!hasPendingStops) {
    localStorage.removeItem("route");
    localStorage.removeItem("depotPostcode");
    setRoute([]);
    setShowDriverView(false);
    return;
  }

  setRoute(savedRoute); // ✅ Optimized order preserved
};

  if (showDriverView) {
    return (
      <DriverRoute
        route={route}
        onRefresh={refreshRoute}
      />
    );
  }

  const totalDistance = route.reduce(
    (sum, stop) =>
      sum + (stop.distanceFromPrevious || 0),
    0
  );

  const longestJump =
    route.length > 0
      ? Math.max(
          ...route.map(
            (stop) =>
              stop.distanceFromPrevious || 0
          )
        )
      : 0;

  const shortestJump =
    route.length > 0
      ? Math.min(
          ...route.map(
            (stop) =>
              stop.distanceFromPrevious || 0
          )
        )
      : 0;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Optimize Route</h1>

      <input
        type="text"
        placeholder="Depot Postcode"
        value={depotPostcode}
        onChange={(e) =>
          setDepotPostcode(e.target.value)
        }
        style={{
          padding: "10px",
          marginRight: "10px",
        }}
      />

      <button onClick={handleOptimize}>
        Optimize
      </button>

      <hr />

      <h2>📍 Route Preview</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          background: "#f8f9fa",
        }}
      >
        <p>
          🚚 Total Stops: {route.length}
        </p>

        <p>
          📏 Total Distance:{" "}
          {totalDistance.toFixed(2)} km
        </p>

        <p>
          🔥 Longest Jump:{" "}
          {longestJump.toFixed(2)} km
        </p>

        <p>
          ⚡ Shortest Jump:{" "}
          {shortestJump.toFixed(2)} km
        </p>
      </div>

      {route.map((stop, index) => (
        <div
          key={stop._id}
          style={{
            marginBottom: "12px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            background:
              stop.distanceFromPrevious > 5
                ? "#fff3cd"
                : "#f8f9fa",
          }}
        >
          <strong>
            Stop {index + 1}
          </strong>

          <p>
            📮 {stop.postcode}
          </p>

          <p>
            📏 Distance From Previous:{" "}
            {stop.distanceFromPrevious?.toFixed(
              2
            )}{" "}
            km
          </p>

          {stop.distanceFromPrevious > 5 && (
            <p
              style={{
                color: "#ff8800",
                fontWeight: "bold",
              }}
            >
              ⚠ Long Distance Jump
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default OptimizedRoute;