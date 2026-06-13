import { useEffect, useState, useRef } from "react";
import { completeStop, getStops } from "../services/stopService";

const ARRIVAL_RADIUS_METRES = 50; // auto-prompt when within 50m

const toRadians = (deg) => (deg * Math.PI) / 180;

const getDistanceMetres = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const DriverRoute = ({ route, onRefresh }) => {
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [arrivedPrompt, setArrivedPrompt] = useState(false);
  const [distanceToStop, setDistanceToStop] = useState(null);
  const [locationError, setLocationError] = useState("");
  const watchIdRef = useRef(null);

  const currentStop = (route || []).find((stop) => !stop.completed);

  const loadStats = async () => {
    try {
      const response = await getStops();
      const allStops = response.data;
      setStats({
        total: allStops.length,
        completed: allStops.filter((stop) => stop.completed).length,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Watch driver's GPS position continuously
  useEffect(() => {
    loadStats();

    if (!navigator.geolocation) {
      setLocationError("GPS not supported on this device");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocationError("");
        const { latitude, longitude } = position.coords;

        if (!currentStop) return;

        const metres = getDistanceMetres(
          latitude,
          longitude,
          currentStop.latitude,
          currentStop.longitude
        );

        setDistanceToStop(Math.round(metres));

        // ✅ Auto-prompt when within 50 metres
        if (metres <= ARRIVAL_RADIUS_METRES) {
          setArrivedPrompt(true);
        }
      },
      (err) => {
        if (err.code === 1) setLocationError("Please allow location access for arrival detection");
        else setLocationError("GPS unavailable — navigation still works");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    // Cleanup GPS watcher when stop changes or component unmounts
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [currentStop?._id]); // re-run when stop changes

  const handleDelivered = async () => {
    if (!currentStop) return;

    try {
      await completeStop(currentStop._id);

      const savedRoute = JSON.parse(localStorage.getItem("route") || "[]");
      const updatedRoute = savedRoute.map((stop) =>
        stop._id === currentStop._id ? { ...stop, completed: true } : stop
      );
      localStorage.setItem("route", JSON.stringify(updatedRoute));

      setArrivedPrompt(false);
      setDistanceToStop(null);
      await loadStats();
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigate = () => {
    // ✅ Level 1 — launches Google Maps with full turn-by-turn navigation
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${currentStop.latitude},${currentStop.longitude}&travelmode=driving`,
      "_blank"
    );
  };

  // Guard — must be AFTER all hooks
  if (!route || route.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>No stops loaded</h2>
        <p>Go back and optimize your route first.</p>
      </div>
    );
  }

  const totalStops = stats.total;
  const completedStops = stats.completed;
  const remainingStops = totalStops - completedStops;
  const progress = totalStops > 0
    ? Math.round((completedStops / totalStops) * 100) : 0;

  if (!currentStop) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>🎉 Route Complete</h1>
        <p>All deliveries finished.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Current Stop</h2>

      {/* ✅ Auto-arrival banner */}
      {arrivedPrompt && (
        <div style={{
          background: "#22c55e", color: "white",
          padding: "16px", borderRadius: "12px",
          textAlign: "center", marginBottom: "16px",
          fontSize: "20px", fontWeight: "bold",
          animation: "pulse 1s infinite",
        }}>
          📍 You have arrived at {currentStop.postcode}!
          <br />
          <span style={{ fontSize: "16px", fontWeight: "normal" }}>
            Tap Delivered once done
          </span>
        </div>
      )}

      <div style={{ border: "1px solid #ccc", borderRadius: "12px", padding: "25px" }}>
        <h1 style={{ fontSize: "5rem", textAlign: "center", marginBottom: "20px" }}>
          {currentStop.postcode}
        </h1>

        {/* ✅ Live distance indicator */}
        {distanceToStop !== null && (
          <p style={{
            textAlign: "center", fontSize: "20px",
            color: distanceToStop <= ARRIVAL_RADIUS_METRES ? "#22c55e" : "#f97316",
            fontWeight: "bold", marginBottom: "10px",
          }}>
            📡 {distanceToStop <= ARRIVAL_RADIUS_METRES
              ? "You are here!"
              : `${distanceToStop}m away`}
          </p>
        )}

        {locationError && (
          <p style={{
            textAlign: "center", fontSize: "14px",
            color: "#888", marginBottom: "10px",
          }}>
            ⚠️ {locationError}
          </p>
        )}

        <p style={{ textAlign: "center", fontSize: "24px" }}>
          Stops Remaining: {remainingStops}
        </p>

        <p style={{ textAlign: "center", fontSize: "22px" }}>
          Completed: {completedStops} / {totalStops}
        </p>

        <p style={{ textAlign: "center", fontSize: "22px", fontWeight: "bold" }}>
          Progress: {progress}%
        </p>

        <div style={{
          width: "100%", height: "22px", background: "#ddd",
          borderRadius: "12px", overflow: "hidden",
          marginTop: "20px", marginBottom: "25px",
        }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: "#22c55e", transition: "0.4s",
          }} />
        </div>

        {/* ✅ Navigate button — now opens turn-by-turn directions */}
        <button
          onClick={handleNavigate}
          style={{
            width: "100%", padding: "18px", fontSize: "20px",
            marginBottom: "15px", borderRadius: "10px", cursor: "pointer",
            background: "#1a73e8", color: "white", border: "none",
          }}
        >
          🧭 Start Navigation
        </button>

        <button
          onClick={handleDelivered}
          style={{
            width: "100%", padding: "18px", fontSize: "20px",
            borderRadius: "10px", cursor: "pointer",
            background: arrivedPrompt ? "#22c55e" : undefined,
            color: arrivedPrompt ? "white" : undefined,
            border: "none",
          }}
        >
          ✅ Delivered
        </button>
      </div>

      {/* Upcoming stops preview */}
      <div style={{ marginTop: "24px" }}>
        <h3 style={{ marginBottom: "12px" }}>📋 Upcoming Stops</h3>
        {route
          .filter((stop) => !stop.completed && stop._id !== currentStop._id)
          .slice(0, 3) // show next 3 only
          .map((stop, index) => (
            <div key={stop._id} style={{
              padding: "12px 16px", marginBottom: "8px",
              border: "1px solid #ccc", borderRadius: "10px",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", opacity: 0.7,
            }}>
              <span style={{ fontSize: "18px" }}>
                #{index + 2} — {stop.postcode}
              </span>
              <span style={{ fontSize: "14px", color: "#888" }}>
                {stop.distanceFromPrevious?.toFixed(1)} km
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DriverRoute;