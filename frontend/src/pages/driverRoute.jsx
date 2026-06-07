import { useEffect, useState } from "react";
import {
  completeStop,
  getStops,
} from "../services/stopService";

const DriverRoute = ({ route, onRefresh }) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
  });

  const currentStop = route.find(
    (stop) => !stop.completed
  );

  
  const loadStats = async () => {
  try {
    const response = await getStops();

    
    const allStops = response.data.data;

    console.log("ALL STOPS:", allStops);

    setStats({
      total: allStops.length,
      completed: allStops.filter(
        (stop) => stop.completed
      ).length,
    });
  } catch (error) {
    console.error(error);
  }
}; 

  useEffect(() => {
    loadStats();
  }, []);

  const handleDelivered = async () => {
    if (!currentStop) return;

    try {
      await completeStop(currentStop._id);

      await loadStats();

      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const totalStops = stats.total;

  const completedStops = stats.completed;

  const remainingStops =
    totalStops - completedStops;

  const progress =
    totalStops > 0
      ? Math.round(
          (completedStops / totalStops) * 100
        )
      : 0;

      console.log("TOTAL:", totalStops);
console.log("COMPLETED:", completedStops);
console.log("REMAINING:", remainingStops);
console.log("PROGRESS:", progress);

  if (!currentStop) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1>🎉 Route Complete</h1>

        <p>
          All deliveries finished.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          textAlign: "center",
        }}
      >
        Current Stop
      </h2>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "12px",
          padding: "25px",
        }}
      >
        <h1
          style={{
            fontSize: "5rem",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {currentStop.postcode}
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "24px",
          }}
        >
          Stop Remaining: {remainingStops}
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "22px",
          }}
        >
          Completed: {completedStops} / {totalStops}
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          Progress: {progress}%
        </p>

        <div
          style={{
            width: "100%",
            height: "22px",
            background: "#ddd",
            borderRadius: "12px",
            overflow: "hidden",
            marginTop: "20px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#22c55e",
              transition: "0.4s",
            }}
          />
        </div>

        <button
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${currentStop.latitude},${currentStop.longitude}`,
              "_blank"
            );
          }}
          style={{
            width: "100%",
            padding: "18px",
            fontSize: "20px",
            marginBottom: "15px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          🧭 Navigate
        </button>

        <button
          onClick={handleDelivered}
          style={{
            width: "100%",
            padding: "18px",
            fontSize: "20px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ✅ Delivered
        </button>
      </div>
    </div>
  );
};

export default DriverRoute;