import { useState, useEffect } from "react";
import { optimizeRoute } from "../services/routeService";
import DriverRoute from "./DriverRoute";

const OptimizedRoute = () => {
  const [depotPostcode, setDepotPostcode] = useState("");
  const [route, setRoute] = useState([]);
  const [showDriverView, setShowDriverView] = useState(false);

  useEffect(() => {
    const savedRoute = localStorage.getItem("route");
    const savedDepot = localStorage.getItem("depotPostcode");

    if (savedRoute) {
      const parsedRoute = JSON.parse(savedRoute);

      // Only restore if there are pending stops
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

  const refreshRoute = async () => {
    if (!depotPostcode.trim()) return;

    try {
      const response = await optimizeRoute(
        depotPostcode
      );

      const updatedRoute = response.data;

      // All stops completed
      if (
        updatedRoute.length === 0 ||
        updatedRoute.every(
          (stop) => stop.completed
        )
      ) {
        localStorage.removeItem("route");
        localStorage.removeItem("depotPostcode");

        setRoute([]);
        setShowDriverView(false);

        return;
      }

      setRoute(updatedRoute);

      localStorage.setItem(
        "route",
        JSON.stringify(updatedRoute)
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (showDriverView) {
    return (
      <DriverRoute
        route={route}
        onRefresh={refreshRoute}
      />
    );
  }

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
      />

      <button onClick={handleOptimize}>
        Optimize
      </button>

      <hr />

      <h2>Optimized Stops</h2>

      {route.map((stop, index) => (
        <div
          key={stop._id}
          style={{
            marginBottom: "12px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <strong>
            Stop {index + 1}
          </strong>

          <p>{stop.postcode}</p>

          <p>
            Distance From Previous:{" "}
            {stop.distanceFromPrevious?.toFixed(
              2
            )}{" "}
            km
          </p>
        </div>
      ))}
    </div>
  );
};

export default OptimizedRoute;